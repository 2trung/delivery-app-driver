import axios from 'axios'
import { setItemAsync, getItemAsync, deleteItemAsync } from 'expo-secure-store'
import useAuth from '@/store/authSlice'

const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
})

instance.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await getItemAsync('accessToken')
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    } catch (error) {
      return Promise.reject(error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        const refreshToken = await getItemAsync('refreshToken')
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${process.env.EXPO_PUBLIC_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          )
          const { accessToken } = refreshResponse.data.data
          await setItemAsync('accessToken', accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axios(originalRequest)
        }
      } catch (error) {
        await deleteItemAsync('accessToken')
        await deleteItemAsync('refreshToken')
        useAuth.getState().removeAuth()
      }
    } else if (error.response) {
      const errorMessage = error.response.data.message || 'Mạng không ổn định'
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      return Promise.reject(new Error('Mạng không ổn định'))
    } else {
      return Promise.reject(new Error(error.message))
    }
  }
)

export default instance
