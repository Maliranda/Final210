import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'

export function useRequireAuthAction(message: string) {
  const auth = useAuth()
  const navigate = useNavigate()
  const requireLogin = authService.isConfigured()
  const [open, setOpen] = useState(false)

  const guard = (): boolean => {
    if (!requireLogin) return true
    if (auth?.user) return true
    setOpen(true)
    return false
  }

  const goLogin = () => {
    setOpen(false)
    navigate('/login')
  }

  return { open, setOpen, guard, goLogin, message }
}

