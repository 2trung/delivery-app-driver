import { create } from 'zustand'

interface AuthState {
  isLogin: boolean
  accessToken: string
  refreshToken: string
  setIsLogin: (isLogin: boolean) => void
  setToken: (accessToken: string, refreshToken: string) => void
}

const createAuth = create<AuthState>((set) => ({
  isLogin: false,
  accessToken: '',
  refreshToken: '',
  setIsLogin: (isLogin: boolean) => set(() => ({ isLogin })),
  setToken: (accessToken: string, refreshToken: string) =>
    set(() => ({ accessToken, refreshToken })),
}))

export default createAuth
