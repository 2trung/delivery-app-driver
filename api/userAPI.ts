import { User } from '@/types/type'
import axios from '@/utils/axiosInstance'

const getUserInfo = async (): Promise<User> => {
  const response = await axios.get('/user')
  return response.data.data
}

export { getUserInfo }
