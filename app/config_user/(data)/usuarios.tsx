"use client"

import { useEffect, useState } from "react"
import { User } from "../(table)/columns"
import { useAuth } from "@/context/AuthProvider"

const tablas = [
  {
    id: 1,
    nombre: "Lista de Usuarios",
  },
  {
    id: 2,
    nombre: "Lista de Roles",
  },
  {
    id: 3,
    nombre: "Lista de Modulos",
  },
  {
    id: 4,
    nombre: "Lista de Submodulos",
  },
]

export default function DataUsuarios() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    const cargarUsuarios = async () => {
      try {
        const res = await fetch("/api/usuarios/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
          }),
        })
        const users = await res.json()
        if (mounted) {
          setData(normalizeUsers(users))
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    cargarUsuarios()
    return () => {
      mounted = false
    }
  }, [user])

  const normalizeUsers = (users: unknown): User[] => {
    if (Array.isArray(users)) return users
    if (users && typeof users === "object") {
      const maybeData = (users as { data?: unknown }).data
      if (Array.isArray(maybeData)) return maybeData
    }
    return []
  }

  const refetchUsuarios = async () => {
    const res = await fetch("/api/usuarios/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user?.id,
      }),
    })
    const users = await res.json()
    setData(normalizeUsers(users))
  }

  const deshabilitarUsuario = async (usuario_id: number) => {
    try {
      const res = await fetch("/api/usuarios/deshabilitar_usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_user_id: user?.id,
          usuario_id,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.detail || "Error al deshabilitar el usuario")
        return
      }

      setData((prev) =>
        prev.map((u) => (u.id === usuario_id ? { ...u, habilitado: 0 } : u))
      )
    } catch {
      alert("Error de conexión con la API")
    }
  }

  const habilitarUsuario = async (usuario_id: number) => {
    const res = await fetch("/api/usuarios/habilitar_usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_user_id: user?.id,
        usuario_id,
      }),
    })

    if (!res.ok) return

    setData((prev) =>
      prev.map((u) => (u.id === usuario_id ? { ...u, habilitado: 1 } : u))
    )
  }
  const eliminarUsuario = async (usuario_id: number) => {
    const confirmar = confirm(
      "¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
    )

    if (!confirmar) return

    try {
      const res = await fetch("/api/proxy/auth/eliminar_usuario", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_user_id: user?.id,
          usuario_id,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.detail || "Error al eliminar el usuario")
        return
      }

      setData((prev) => prev.filter((u) => u.id !== usuario_id))
    } catch {
      alert("Error de conexión con la API")
    }
  }

  const editarUsuario = (id: number | undefined, username: string) => {
    setUserIdToEdit(id)
    setUserToEdit(username)
    setIsEditDialogOpen(true)
  }

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false)
    setUserToEdit(null)
    setUserIdToEdit(undefined)
    refetchUsuarios()
  }

  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToEdit, setUserToEdit] = useState<string | null>(null)
  const [userIdToEdit, setUserIdToEdit] = useState<number | undefined>(
    undefined
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
}
