import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query'
import { SplashScreen, Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { getUserInfo } from '@/api/userAPI'
import useAuth from '@/store/authSlice'
import useLocation from '@/store/locationSlice'
import * as Location from 'expo-location'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { StatusBar } from 'react-native'
import useUser from '@/store/userSlice'

SplashScreen.preventAutoHideAsync()
export default function RootLayout() {
  const router = useRouter()
  const { setUser } = useUser()
  const queryClient = new QueryClient()
  const { setIsLogin, setToken } = useAuth()
  const { setDriverLocation } = useLocation()

  const getUser = async () => {
    try {
      const user = await getUserInfo()
      setUser(user)
      setIsLogin(true)
      router.replace('/home')
      // router.replace({
      //   pathname: '/chat/[orderId]',
      //   params: {
      //     orderId: '1',
      //   },
      // })
    } catch (error) {
      router.replace('/')
    }
    SplashScreen.hideAsync()
  }

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      console.log('Permission to access location was denied')
      return
    }
    const location = await Location.getCurrentPositionAsync({})
    setDriverLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
  }

  useEffect(() => {
    getUser()
    getLocation()
  }, [])

  return (
    <BottomSheetModalProvider>
      <StatusBar barStyle='dark-content' />
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='index' />
          <Stack.Screen name='home' />
          <Stack.Screen name='chat' />
        </Stack>
      </QueryClientProvider>
    </BottomSheetModalProvider>
  )
}
