import React from 'react'

interface PieChartProps {
  data: {
    label: string
    value: number
    color: string
  }[]
  title: string
  size?: number
}

const PieChart: React.FC<PieChartProps> = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const createPieSlice = (item: any, index: number) => {
    const percentage = (item.value / total) * 100
    const startAngle = data
      .slice(0, index)
      .reduce((sum, d) => sum + (d.value / total) * 360, 0)
    
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 50 + 40 * Math.cos(((startAngle + (item.value / total) * 360) * Math.PI) / 180)
    const y2 = 50 + 40 * Math.sin(((startAngle + (item.value / total) * 360) * Math.PI) / 180)
    
    const largeArcFlag = (item.value / total) * 360 > 180 ? 1 : 0
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="#fff"
        strokeWidth="2"
      />
    )
  }
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="pie-chart-container">
        <svg width={size} height={size} viewBox="0 0 100 100">
          {data.map((item, index) => createPieSlice(item, index))}
        </svg>
        <div className="pie-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="legend-label">
                {item.label} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PieChart 