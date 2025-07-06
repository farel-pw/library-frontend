"use client"

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface ChartProps {
  data: any[]
  height?: number
}

export const MonthlyTrendsChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="mois" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="emprunts" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Emprunts"
        />
        <Line 
          type="monotone" 
          dataKey="reservations" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Réservations"
        />
        <Line 
          type="monotone" 
          dataKey="utilisateurs" 
          stroke="#ffc658" 
          strokeWidth={2}
          name="Nouveaux utilisateurs"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const TopBooksChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" fontSize={12} />
        <YAxis 
          dataKey="titre" 
          type="category" 
          width={150}
          fontSize={10}
          tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
        />
        <Tooltip 
          formatter={(value, name) => [value, name === 'emprunts' ? 'Emprunts' : name]}
          labelFormatter={(label) => `Livre: ${label}`}
        />
        <Bar dataKey="emprunts" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const GenreStatsChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ genre, percent }) => `${genre} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="nombre"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const BorrowsActivityChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="emprunts" 
          stackId="1"
          stroke="#8884d8" 
          fill="#8884d8"
          name="Emprunts"
        />
        <Area 
          type="monotone" 
          dataKey="retours" 
          stackId="1"
          stroke="#82ca9d" 
          fill="#82ca9d"
          name="Retours"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const UsersActivityChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="nom" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          formatter={(value, name) => [value, name === 'emprunts' ? 'Emprunts actifs' : name]}
          labelFormatter={(label) => `Utilisateur: ${label}`}
        />
        <Bar dataKey="emprunts" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel,
  className = "" 
}) => {
  const getTrendColor = () => {
    if (trend === undefined) return ""
    return trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"
  }

  const getTrendIcon = () => {
    if (trend === undefined) return null
    if (trend > 0) return "↗"
    if (trend < 0) return "↘"
    return "→"
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${getTrendColor()}`}>
              {getTrendIcon()} {Math.abs(trend)}% {trendLabel || "vs mois dernier"}
            </p>
          )}
        </div>
        <div className="text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  )
}
