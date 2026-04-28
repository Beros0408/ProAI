'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const data = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 22000 },
  { month: 'May', revenue: 25000 },
  { month: 'Jun', revenue: 28000 },
  { month: 'Jul', revenue: 32000 },
  { month: 'Aug', revenue: 35000 },
  { month: 'Sep', revenue: 38000 },
  { month: 'Oct', revenue: 42000 },
  { month: 'Nov', revenue: 45000 },
  { month: 'Dec', revenue: 48000 },
]

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface border border-[#1E1E2E] rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Revenus Mensuels</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `€${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenus']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}