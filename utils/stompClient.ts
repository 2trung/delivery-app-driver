import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { TextEncoder, TextDecoder } from 'text-encoding'
import * as SecureStore from 'expo-secure-store'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const stompClient = new Client({
  webSocketFactory: () => new SockJS(`${process.env.EXPO_PUBLIC_BASE_URL}/ws`),
  connectHeaders: {
    Authorization: 'Bearer ' + SecureStore.getItem('accessToken'),
  },
  reconnectDelay: 5000,
  // debug: (str) => {
  //   console.log(str)
  // },
})

// stompClient.onConnect = () => {
//     stompClient.subscribe('/topic/example', (message) => {
//       console.log('Received message:', message.body)
//     })
//   }

export default stompClient
