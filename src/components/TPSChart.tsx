import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TPSDataPoint {
  time: string
  tps: number
  blockNumber: number
}

interface TPSChartProps {
  data: TPSDataPoint[]
}

const TPSChart: React.FC<TPSChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3>TPS Over Time</h3>
        <p>Collecting data...</p>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>TPS Over Time</h3>
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
          />
          <Line 
            type="monotone" 
            dataKey="tps" 
            stroke="#a8e6cf" 
            strokeWidth={3}
            dot={{ fill: '#a8e6cf', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#a8e6cf', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TPSChart 