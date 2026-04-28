'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const data = [
  { stage: 'Visiteurs', count: 10000, color: '#0ea5e9' },
  { stage: 'Leads', count: 2500, color: '#3b82f6' },
  { stage: 'Prospects', count: 800, color: '#8b5cf6' },
  { stage: 'Clients', count: 320, color: '#fb923c' },
]

export function ConversionFunnel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-surface border border-[#1E1E2E] rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Entonnoir de Conversion</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              dataKey="stage"
              type="category"
              stroke="#9CA3AF"
              fontSize={12}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Nombre']}
            />
            <Bar
              dataKey="count"
              fill="#0ea5e9"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}