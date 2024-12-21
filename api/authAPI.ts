import axios from '@/utils/axiosInstance'

const login = async (phoneNumber: string, password: string) => {
  const response = await axios.post('/auth/login', { phoneNumber, password })
  return response.data.data
}

export { login }
