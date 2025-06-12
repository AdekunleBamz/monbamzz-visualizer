import React from 'react'

interface BarChartProps {
  data: {
    label: string
    value: number
    color?: string
  }[]
  title: string
  height?: number
}

const BarChart: React.FC<BarChartProps> = ({ data, title, height = 300 }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="bar-chart" style={{ height: `${height}px` }}>
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-label">{item.label}</div>
            <div className="bar-wrapper">
              <div 
                className="bar"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#4ecdc4'
                }}
              >
                <span className="bar-value">{item.value.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BarChart 