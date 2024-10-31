import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          alignSelf: 'center',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon: JSX.Element = (
            <Ionicons name='compass-outline' size={24} color={'#9A9A9A'} />
          )
          size = 24
          switch (route.name) {
            case 'home':
              icon = focused ? (
                <Ionicons name='compass' size={24} color={'#4FAE5A'} />
              ) : (
                <Ionicons name='compass-outline' size={24} color={'#9A9A9A'} />
              )
              break
            case 'history':
              icon = focused ? (
                <Ionicons name='document-text' size={24} color='#4FAE5A' />
              ) : (
                <Ionicons
                  name='document-text-outline'
                  size={24}
                  color='#9A9A9A'
                />
              )
              break
            case 'notification':
              icon = focused ? (
                <MaterialIcons name='notifications' size={24} color='#4FAE5A' />
              ) : (
                <MaterialIcons
                  name='notifications-none'
                  size={24}
                  color='#9A9A9A'
                />
              )
              break

            case 'user':
              icon = focused ? (
                <Ionicons name='person' size={24} color={'#4FAE5A'} />
              ) : (
                <Ionicons name='person-outline' size={24} color={'#9A9A9A'} />
              )
              break
          }
          return icon
        },
        tabBarActiveTintColor: '#4FAE5A',
        tabBarInactiveTintColor: '#9A9A9A',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          flex: 1,
        },
        tabBarItemStyle: {
          marginTop: 10,
        },
      })}
    >
      <Tabs.Screen name='home' options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name='history' options={{ title: 'Lịch sử' }} />
      <Tabs.Screen name='notification' options={{ title: 'Thông báo' }} />
      <Tabs.Screen name='user' options={{ title: 'Cá nhân' }} />
    </Tabs>
  )
}
