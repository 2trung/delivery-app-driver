import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TextInput } from 'react-native-paper'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { login } from '@/api/authAPI'

const Login = () => {
  const router = useRouter()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      console.log('call login')
      return login(phoneNumber, password)
    },
    enabled: false,
    retry: false,
  })

  const [isShowPassword, setIsShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [formError, setFormError] = useState('')
  const handleLogin = async () => {
    setFormError('')
    if (!validatePhoneNumber(phoneNumber)) {
      setFormError('Số điện thoại không hợp lệ')
      return
    }
    if (!password) {
      setFormError('Mật khẩu không được để trống')
      return
    }
    refetch()
  }
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneNumberRegex = /^0?[35789][0-9]{8}$/
    return phoneNumberRegex.test(phoneNumber)
  }

  useEffect(() => {
    if (data) {
      router.push('/(tabs)/home')
    }
  }, [data])

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.title}>Đăng nhập tài khoản</Text>
        <Text>Hãy nhập mật khẩu để đăng nhập tài khoản của bạn.</Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          label='Số điện thoại'
          keyboardType='number-pad'
          mode='outlined'
          outlineColor='#dddee5'
          activeOutlineColor={'#3DB24B'}
          theme={{ roundness: 10 }}
          value={phoneNumber}
          placeholderTextColor='#999'
          cursorColor={'black'}
          onChangeText={(value) => {
            setFormError('')
            setPhoneNumber(value)
          }}
        />

        <TextInput
          style={styles.input}
          value={password}
          label='Mật khẩu'
          placeholderTextColor='#999'
          keyboardType='default'
          secureTextEntry={isShowPassword ? false : true}
          cursorColor={'black'}
          mode='outlined'
          outlineColor='#dddee5'
          activeOutlineColor={'#3DB24B'}
          theme={{ roundness: 10 }}
          right={
            isPasswordFocused &&
            (isShowPassword ? (
              <TextInput.Icon
                icon='eye'
                size={16}
                onPress={() => setIsShowPassword(false)}
              />
            ) : (
              <TextInput.Icon
                icon='eye-off'
                size={16}
                onPress={() => setIsShowPassword(true)}
              />
            ))
          }
          //   onChangeText={(value) => setPassword(value)}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          onChangeText={(value) => {
            setFormError('')
            setPassword(value)
          }}
        />
      </View>
      {formError && (
        <View style={styles.errorContainer}>
          <Ionicons name='warning' size={16} color='#d30000' />
          <Text
            style={{
              color: '#d30000',
            }}
          >
            {formError}
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name='warning' size={16} color='#d30000' />
          <Text
            style={{
              color: '#d30000',
            }}
          >
            {error.message}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.submitButton}
          onPress={() => handleLogin()}
        >
          {isLoading ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              Đăng nhập
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Login
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
  },
  input: {
    marginTop: 10,
    borderBottomWidth: 0,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#00870E',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
})
