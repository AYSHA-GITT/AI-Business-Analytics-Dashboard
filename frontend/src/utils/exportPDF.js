import jsPDF from "jspdf";

export function exportDashboardAsPDF(uploadResult) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  pdf.text("Business Analytics Report", 15, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text(`File: ${uploadResult.filename}`, 15, y);
  y += 6;
  pdf.text(`${uploadResult.rows} rows, ${uploadResult.columns} columns`, 15, y);
  y += 6;
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 15, y);
  y += 12;

  // Data Quality Section
  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("Data Quality", 15, y);
  y += 8;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  const quality = uploadResult.quality_report;
  if (quality) {
    pdf.text(`Quality Score: ${quality.quality_score}/100`, 15, y);
    y += 7;
    if (quality.issues && quality.issues.length > 0) {
      quality.issues.forEach((issue) => {
        const lines = pdf.splitTextToSize(`- [${issue.severity}] ${issue.message}`, pageWidth - 30);
        pdf.text(lines, 15, y);
        y += lines.length * 6;
      });
    } else {
      pdf.text("No issues found.", 15, y);
      y += 7;
    }
  }
  y += 8;

  // Forecast Section
  if (uploadResult.forecast_data && !uploadResult.forecast_data.error) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("Forecast Summary", 15, y);
    y += 8;

    pdf.setFontSize(11);
    pdf.setFont(undefined, "normal");
    const forecast = uploadResult.forecast_data.forecast;
    const total = forecast.reduce((sum, row) => sum + row.predicted, 0);
    pdf.text(
      `Predicted total for next ${uploadResult.forecast_data.periods_forecasted} days: Rs. ${Math.round(total).toLocaleString()}`,
      15,
      y
    );
    y += 10;
  }

  // Check if we need a new page for anomalies
  if (y > 250) {
    pdf.addPage();
    y = 20;
  }

  // Anomalies Section
  if (uploadResult.anomalies && uploadResult.anomalies.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("Anomalies Detected", 15, y);
    y += 8;

    pdf.setFontSize(11);
    pdf.setFont(undefined, "normal");
    uploadResult.anomalies.forEach((anomaly) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFont(undefined, "bold");
      pdf.text(`${anomaly.date} - ${anomaly.direction.toUpperCase()}`, 15, y);
      y += 6;
      pdf.setFont(undefined, "normal");
      const lines = pdf.splitTextToSize(anomaly.explanation, pageWidth - 30);
      pdf.text(lines, 15, y);
      y += lines.length * 6 + 4;
    });
  }

  pdf.save(`${uploadResult.filename}_report.pdf`);
}