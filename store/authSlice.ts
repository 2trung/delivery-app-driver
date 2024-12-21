import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

interface AuthState {
  isLogin: boolean
  accessToken: string
  refreshToken: string
  setIsLogin: (isLogin: boolean) => void
  setToken: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

const createAuth = create<AuthState>((set) => ({
  isLogin: false,
  accessToken: '',
  refreshToken: '',
  setIsLogin: (isLogin: boolean) => set(() => ({ isLogin })),
  setToken: (accessToken: string, refreshToken: string) => {
    SecureStore.setItemAsync('accessToken', accessToken)
    SecureStore.setItemAsync('refreshToken', refreshToken)
    set(() => ({ accessToken, refreshToken }))
  },
  logout: () => {
    SecureStore.deleteItemAsync('accessToken')
    SecureStore.deleteItemAsync('refreshToken')
    set(() => ({ isLogin: false, accessToken: '', refreshToken: '' }))
  },
}))

export default createAuth
