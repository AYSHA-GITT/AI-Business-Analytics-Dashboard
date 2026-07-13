import ForecastChart from "../components/ForecastChart";
import WhatIfSimulator from "../components/WhatIfSimulator";

function ForecastPage({ uploadResult }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Step 03</p>
        <h1 className="font-display text-4xl text-white mb-2">What's likely next</h1>
        <p className="text-mist">
          {uploadResult.forecast_data?.periods_forecasted || 30}-day projection for {uploadResult.number_col}, based on the trend and seasonality in your data.
        </p>
      </div>
      <ForecastChart forecastData={uploadResult.forecast_data} />
      <WhatIfSimulator />
    </div>
  );
}

export default ForecastPage;