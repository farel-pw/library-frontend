"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Star,
  AlertTriangle,
  CheckCircle,
  Minus
} from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon: React.ReactNode
  status?: 'success' | 'warning' | 'danger' | 'neutral'
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  trend, 
  icon, 
  status = 'neutral' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'danger': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.isPositive) return <TrendingUp className="h-3 w-3" />
    return <TrendingDown className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${getStatusColor()}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mb-2">
            {description}
          </p>
        )}
        {trend && (
          <div className={`flex items-center text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {Math.abs(trend.value)}% par rapport au {trend.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface KPIDashboardProps {
  data: {
    totalUsers: number
    activeUsers: number
    totalBooks: number
    availableBooks: number
    totalBorrows: number
    overdueBorrows: number
    pendingReservations: number
    averageRating: number
    totalComments: number
    pendingComments: number
  }
  trends?: {
    users: number
    borrows: number
    reservations: number
    comments: number
  }
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ data, trends }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Utilisateurs actifs"
        value={data.activeUsers}
        description={`${data.totalUsers} utilisateurs au total`}
        icon={<Users className="h-4 w-4" />}
        trend={trends ? {
          value: trends.users,
          isPositive: trends.users > 0,
          period: "mois dernier"
        } : undefined}
        status={data.activeUsers > data.totalUsers * 0.7 ? 'success' : 'warning'}
      />
      
      <MetricCard
        title="Livres disponibles"
        value={data.availableBooks}
        description={`${data.totalBooks} livres au total`}
        icon={<BookOpen className="h-4 w-4" />}
        status={data.availableBooks > data.totalBooks * 0.5 ? 'success' : 'warning'}
      />
      
      <MetricCard
        title="Emprunts en cours"
        value={data.totalBorrows}
        description={data.overdueBorrows > 0 ? `${data.overdueBorrows} en retard` : 'Aucun retard'}
        icon={<Clock className="h-4 w-4" />}
        trend={trends ? {
          value: trends.borrows,
          isPositive: trends.borrows > 0,
          period: "mois dernier"
        } : undefined}
        status={data.overdueBorrows > 0 ? 'danger' : 'success'}
      />
      
      <MetricCard
        title="Note moyenne"
        value={data.averageRating ? `${data.averageRating.toFixed(1)}/5` : 'N/A'}
        description={`${data.totalComments} avis`}
        icon={<Star className="h-4 w-4" />}
        status={data.averageRating >= 4 ? 'success' : data.averageRating >= 3 ? 'warning' : 'danger'}
      />
      
      <MetricCard
        title="Réservations en attente"
        value={data.pendingReservations}
        description="À traiter"
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={trends ? {
          value: trends.reservations,
          isPositive: trends.reservations < 0, // Moins de réservations en attente = mieux
          period: "mois dernier"
        } : undefined}
        status={data.pendingReservations > 10 ? 'danger' : data.pendingReservations > 5 ? 'warning' : 'success'}
      />
      
      <MetricCard
        title="Commentaires en attente"
        value={data.pendingComments}
        description="À modérer"
        icon={<CheckCircle className="h-4 w-4" />}
        trend={trends ? {
          value: trends.comments,
          isPositive: trends.comments < 0, // Moins de commentaires en attente = mieux
          period: "mois dernier"
        } : undefined}
        status={data.pendingComments > 5 ? 'warning' : 'success'}
      />
      
      <div className="md:col-span-2 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">État du système</CardTitle>
            <CardDescription>
              Résumé des métriques importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taux d'occupation</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ 
                        width: `${((data.totalBooks - data.availableBooks) / data.totalBooks) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold">
                    {Math.round(((data.totalBooks - data.availableBooks) / data.totalBooks) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Utilisateurs actifs</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-600 rounded-full"
                      style={{ 
                        width: `${(data.activeUsers / data.totalUsers) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold">
                    {Math.round((data.activeUsers / data.totalUsers) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-yellow-600 rounded-full"
                      style={{ 
                        width: `${(data.averageRating / 5) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold">
                    {data.averageRating ? `${data.averageRating.toFixed(1)}/5` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
