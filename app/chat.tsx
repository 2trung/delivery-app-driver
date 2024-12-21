import React, { useEffect, useRef, useState } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import stompClient from '@/utils/stompClient'
import useUser from '@/store/userSlice'
import useOrder from '@/store/orderSlice'
import { Avatar } from 'react-native-paper'
import { getMessages } from '@/api/orderAPI'
import { useQuery } from '@tanstack/react-query'

const Chat = () => {
  const { order } = useOrder()
  const { user } = useUser()
  const [messages, setMessages] = useState<any>([])
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)
  useEffect(() => {
    stompClient.activate()
    // stompClient.onConnect = () => {
    stompClient.subscribe(`/topic/chat/${order?.id}`, (message) => {
      const byteArray = new Uint8Array(message.binaryBody)
      const decoder = new TextDecoder('utf-8')
      const decodedMessage = JSON.parse(decoder.decode(byteArray))
      handleNewMessage(
        decodedMessage.content,
        decodedMessage.senderId,
        decodedMessage.createdAt
      )
      console.log(decodedMessage)
    })
    // }
    return () => {
      stompClient.deactivate()
    }
  }, [])
  const handleNewMessage = (
    content: string,
    senderId: string,
    createdAt: string
  ) => {
    const newMessage = {
      senderId: senderId,
      content: content,
      createdAt: createdAt,
    }
    setMessages((prevMessages: any) => [...prevMessages, newMessage])
  }
  const publishMessage = (content: string) => {
    if (!order?.id) return
    stompClient.publish({
      destination: `/app/chat/${order?.id}`,
      body: JSON.stringify({
        content: content,
      }),
    })
  }

  const sendMessage = () => {
    if (input.trim()) {
      publishMessage(input)
      setInput('')
    }
  }
  const { data } = useQuery({
    queryKey: ['messages', order?.id],
    queryFn: () => {
      if (!order?.id) return
      return getMessages(order?.id)
    },
    enabled: !!order?.id,
  })

  useEffect(() => {
    console.log(data)
    if (data) {
      setMessages(data)
    }
  }, [data])

  const formatTime = (time: string) => {
    const date = new Date(time)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor='#757575' />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name='arrowleft' size={24} color='black' />
        </TouchableOpacity>
        <View
          style={{
            gap: 10,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Avatar.Icon size={40} icon='account' />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerText}>{order?.user.name}</Text>
            <Text style={styles.headerSubText} numberOfLines={1}>
              {order?.id}
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={messages}
        ref={flatListRef}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        // keyExtractor={(item) => item.id}
        ListFooterComponent={<View style={{ height: 20 }} />}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.senderId === user?.id
                ? styles.myMessage
                : styles.theirMessage,
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                color: item.senderId === user?.id ? '#fff' : 'black',
              }}
            >
              {item.content}
            </Text>
            <Text
              style={[
                styles.timestamp,
                { color: item.senderId === user?.id ? '#fff' : '#848484' },
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
          </View>
        )}
        style={styles.chatArea}
      />
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          cursorColor={'black'}
          selectionHandleColor={'#00880C'}
          selectionColor={'#00880C'}
          placeholder='Nhập tin nhắn...'
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <AntDesign name='arrowup' size={24} color='white' />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    elevation: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubText: {
    fontSize: 14,
    color: 'gray',
  },
  chatArea: {
    flex: 1,
    padding: 16,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    gap: 5,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#00880C',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#BFBFBF',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e5e5e5',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#00880C',
    borderRadius: 50,
    // padding: 10,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default Chat
