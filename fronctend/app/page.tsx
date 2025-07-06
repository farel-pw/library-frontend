"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { user, login, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard/livres")
    }
  }, [user, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const success = await login(loginForm.email, loginForm.password)

    if (success) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre bibliothèque !",
      })
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (user) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 library-bg relative">
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Message de bienvenue */}
            <div className="text-white space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Bienvenue dans votre
                <span className="text-blue-400 block">Bibliothèque Numérique 2IE </span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed">
                Découvrez, réservez et empruntez des milliers de livres en quelques clics. Votre savoir n'a plus de
                limites.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm">10,000+ Livres</p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm">5,000+ Étudiants</p>
                </div>
                <div className="text-center">
                  <Award className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm">Service 24/7</p>
                </div>
              </div>
            </div>

            {/* Formulaires d'authentification */}
            <div className="bg-white rounded-lg shadow-2xl p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Se connecter</CardTitle>
                      <CardDescription>Accédez à votre compte étudiant</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre.email@universite.fr"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Mot de passe</Label>
                          <Input
                            id="password"
                            type="password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Connexion..." : "Se connecter"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Créer un compte</CardTitle>
                      <CardDescription>Rejoignez notre communauté d'étudiants</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => router.push("/inscription")} className="w-full">
                        S'inscrire maintenant
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
