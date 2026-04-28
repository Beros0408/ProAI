'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

const data = [
  { month: 'Jan', linkedin: 2400, instagram: 1800, facebook: 1200 },
  { month: 'Feb', linkedin: 2800, instagram: 2200, facebook: 1600 },
  { month: 'Mar', linkedin: 3200, instagram: 2600, facebook: 2000 },
  { month: 'Apr', linkedin: 3600, instagram: 3000, facebook: 2400 },
  { month: 'May', linkedin: 4000, instagram: 3400, facebook: 2800 },
  { month: 'Jun', linkedin: 4400, instagram: 3800, facebook: 3200 },
  { month: 'Jul', linkedin: 4800, instagram: 4200, facebook: 3600 },
  { month: 'Aug', linkedin: 5200, instagram: 4600, facebook: 4000 },
  { month: 'Sep', linkedin: 5600, instagram: 5000, facebook: 4400 },
  { month: 'Oct', linkedin: 6000, instagram: 5400, facebook: 4800 },
  { month: 'Nov', linkedin: 6400, instagram: 5800, facebook: 5200 },
  { month: 'Dec', linkedin: 6800, instagram: 6200, facebook: 5600 },
]

export function EngagementChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-surface border border-[#1E1E2E] rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Social Media</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="linkedin"
              stackId="1"
              stroke="#0077B5"
              fill="#0077B5"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="instagram"
              stackId="1"
              stroke="#E4405F"
              fill="#E4405F"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="facebook"
              stackId="1"
              stroke="#1877F2"
              fill="#1877F2"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}