"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react"

export default function AdminPage() {
  const stats = [
    {
      title: "Utilisateurs totaux",
      value: "1,234",
      icon: Users,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Livres en stock",
      value: "5,678",
      icon: BookOpen,
      change: "+5%",
      changeType: "positive"
    },
    {
      title: "Emprunts actifs",
      value: "234",
      icon: Clock,
      change: "-8%",
      changeType: "negative"
    },
    {
      title: "Réservations",
      value: "89",
      icon: Calendar,
      change: "+15%",
      changeType: "positive"
    }
  ]

  const recentActivities = [
    { type: "borrow", message: "Nouvel emprunt: 'Le Petit Prince'", time: "Il y a 5 min" },
    { type: "return", message: "Retour: '1984' par Jean Dupont", time: "Il y a 15 min" },
    { type: "reservation", message: "Nouvelle réservation: 'Harry Potter'", time: "Il y a 1h" },
    { type: "comment", message: "Nouveau commentaire sur 'Dune'", time: "Il y a 2h" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Tableau de bord administrateur
        </h1>
        <p className="text-slate-400">
          Vue d'ensemble de votre bibliothèque
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change} par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Activités récentes</CardTitle>
            <CardDescription className="text-slate-400">
              Les dernières actions dans votre bibliothèque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">{activity.message}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Actions rapides</CardTitle>
            <CardDescription className="text-slate-400">
              Raccourcis vers les fonctions principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Gérer les utilisateurs</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Ajouter un livre</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Voir les rapports</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Modérer les avis</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>État du système</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Base de données</p>
                <p className="text-xs text-slate-400">Opérationnelle</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">API</p>
                <p className="text-xs text-slate-400">En ligne</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Sauvegardes</p>
                <p className="text-xs text-slate-400">Dernière: il y a 2h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}