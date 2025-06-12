import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  time: string;
  value: number; // Generic value for TPS, Gas Price, etc.
}

interface LineChartProps {
  data: ChartDataPoint[];
  dataKey: string; // e.g., 'tps' or 'gasPrice'
  chartTitle: string;
  strokeColor: string;
}

const LineChartComponent: React.FC<LineChartProps> = ({ data, dataKey, chartTitle, strokeColor }) => {
  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{chartTitle}</h3>
        <p>Collecting data...</p>
      </div>
    )
  }

  return (
    <div className="chart-section">
      <h3>{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255, 255, 255, 0.7)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.7)"
            fontSize={12}
            domain={[0, 'dataMax + 10']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`${value.toFixed(2)} ${dataKey === 'tps' ? 'TPS' : 'Gwei'}`, chartTitle.includes('TPS') ? 'TPS' : 'Gas Price']}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={3}
            dot={{ fill: strokeColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChartComponent 