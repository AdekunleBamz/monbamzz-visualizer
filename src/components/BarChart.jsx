import React from 'react';

const BarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-section-compact">
        <div className="chart-container">
          <h3 className="chart-title">{title}</h3>
          <div className="chart-loading">No data available</div>
        </div>
      </div>
    );
  }

  // Filter out data points with value 0 if there are other data points
  const validData = data.filter(item => item.value > 0);
  const displayData = validData.length > 0 ? validData : data;

  const maxValue = Math.max(...displayData.map(item => item.value));
  const maxHeight = 200; // Maximum height for bars

  return (
    <div className="chart-section-compact">
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-content">
          <div className="bar-chart">
            {displayData.map((item, index) => {
              const height = maxValue > 0 ? (item.value / maxValue) * maxHeight : 0;
              return (
                <div
                  key={index}
                  className="bar"
                  style={{
                    height: `${height}px`,
                    minHeight: item.value > 0 ? '20px' : '0px'
                  }}
                >
                  <div className="bar-value">{item.value}</div>
                  <div className="bar-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart; 