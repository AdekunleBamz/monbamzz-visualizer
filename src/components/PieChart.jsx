import React from 'react';

const PieChart = ({ data, title }) => {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentDegree = 0; // Use degrees for conic-gradient

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

  // Generate conic-gradient string
  const conicGradientString = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const degree = (percentage / 100) * 360;
    const color = colors[index % colors.length];

    const segment = `${color} ${currentDegree}deg ${(currentDegree + degree)}deg`;
    currentDegree += degree;
    return segment;
  }).join(', ');

  return (
    <div className="chart-section-compact">
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-content">
          <div 
            className="pie-chart" 
            style={{
                background: `conic-gradient(${conicGradientString})`,
                borderRadius: '50%', // Ensure it's a circle
                width: '200px', // Fixed size for the pie itself
                height: '200px',
                flexShrink: 0 // Prevent shrinking in flex container
            }}
          >
            {/* No individual segments needed here */}
          </div>
          
          <div className="pie-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{item.label}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChart; 