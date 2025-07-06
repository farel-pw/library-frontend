"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InscriptionPage() {
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
   password: "",
    confirmPassword: "",
    studentId: "",
    department: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const result = await register({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      password: formData.password,
      studentId: formData.studentId,
      department: formData.department,
    })

    if (result.success) {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      })
      router.push("/connexion")
    } else {
      toast({
        title: "Erreur d'inscription",
        description: result.error || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative py-12 library-bg">
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="max-w-md mx-auto px-4 relative z-10">
          <div className="mb-6">
            <Link href="/" className="flex items-center text-white hover:text-blue-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
              <CardDescription>Créez votre compte étudiant pour accéder à la bibliothèque</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email universitaire</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@2ie.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Numéro étudiant</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    placeholder="Ex: 2024001234"
                    value={formData.studentId}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="Ex: Informatique"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{" "}
                  <Link href="/connexion" className="text-blue-600 hover:text-blue-800">
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
