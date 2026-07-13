import pandas as pd
from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)


def format_indian_currency(value):
    """Format a number in Indian Rupee style, e.g. 5033630 -> ₹50,33,630"""
    try:
        value = float(value)
    except (ValueError, TypeError):
        return None

    is_negative = value < 0
    value = abs(value)
    int_part = int(round(value))
    s = str(int_part)

    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        rest = s[:-3]
        parts = []
        while len(rest) > 2:
            parts.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            parts.insert(0, rest)
        formatted = ",".join(parts) + "," + last3

    return f"₹{'-' if is_negative else ''}{formatted}"


def answer_question(question: str, df: pd.DataFrame) -> dict:
    column_summary = "\n".join([f"- {col} ({str(df[col].dtype)})" for col in df.columns])
    sample_rows = df.head(3).to_string(index=False)

    code_prompt = f"""You are a data analyst assistant. You are given a pandas DataFrame called `df` with these columns:
{column_summary}

Sample rows:
{sample_rows}

Write ONE line of pandas code (no explanations, no markdown, just the code) that computes the answer to this question:
"{question}"

Important: if the question asks about a "daily" or "per day" total/average, first group and sum by the date column, THEN compute the average/total across those daily sums — do not average the raw rows directly, since each day may have multiple rows.

The code must assign the final answer to a variable named `result`.
Only use the `df` variable and pandas. Do not import anything. Do not use print statements.
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": code_prompt}],
        temperature=0,
    )

    generated_code = completion.choices[0].message.content.strip()
    generated_code = generated_code.replace("```python", "").replace("```", "").strip()

    safe_globals = {"pd": pd, "df": df}
    safe_locals = {}

    try:
        exec(generated_code, safe_globals, safe_locals)
        result = safe_locals.get("result", "Could not compute an answer.")
    except Exception as e:
        return {
            "answer": "I couldn't process that question with the current data. Try rephrasing it.",
            "generated_code": generated_code,
            "error": str(e),
        }

    formatted_currency = format_indian_currency(result) if isinstance(result, (int, float)) else None

    explain_prompt = f"""The user asked: "{question}"
The computed answer is: {result}
{"If this is a monetary value, use exactly this pre-formatted amount in your answer: " + formatted_currency if formatted_currency else ""}

Write a short, clear, one-sentence answer in plain English using this result.
Do not perform any currency formatting yourself — use the pre-formatted amount given above if provided.
Do not mention code or pandas."""

    explanation = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": explain_prompt}],
        temperature=0.3,
    )

    final_answer = explanation.choices[0].message.content.strip()

    return {
        "answer": final_answer,
        "generated_code": generated_code,
        "raw_result": str(result),
    }