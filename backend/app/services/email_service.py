import resend
from app.config import settings

resend.api_key = settings.resend_api_key


def send_anomaly_alert(user_email: str, filename: str, anomalies: list):
    if not anomalies:
        return

    rows_html = ""
    for a in anomalies[:10]:  # cap at 10 to keep the email readable
        color = "#2BA88F" if a["direction"] == "spike" else "#E15554"
        rows_html += f"""
        <div style="padding:12px 0;border-bottom:1px solid #eee;">
          <span style="font-family:monospace;color:#12141C;">{a['date']}</span>
          <span style="color:{color};font-weight:600;margin-left:8px;">
            {'▲ SPIKE' if a['direction'] == 'spike' else '▼ DROP'}
          </span>
          <p style="color:#555;margin:4px 0 0 0;font-size:14px;">{a['explanation']}</p>
        </div>
        """

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#12141C;">Anomalies detected in {filename}</h2>
      <p style="color:#555;">We found {len(anomalies)} unusual day(s) in your latest upload:</p>
      {rows_html}
      <p style="color:#999;font-size:12px;margin-top:20px;">
        Sent automatically by your AI Business Analytics Dashboard.
      </p>
    </div>
    """

    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": user_email,
            "subject": f"⚠ {len(anomalies)} anomalies detected in {filename}",
            "html": html,
        })
    except Exception as e:
        print(f"Failed to send email: {e}")