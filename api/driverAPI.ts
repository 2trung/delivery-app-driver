import { Driver } from '@/types/type'
import axios from '@/utils/axiosInstance'

const getDriverDetail = async (id: String): Promise<Driver> => {
  console
  const response = await axios.get('/driver', {
    params: {
      id,
    },
  })
  return response.data.data
}

const changeDriverStatus = async (isOnline: boolean): Promise<Driver> => {
  const response = await axios.put('/driver/status', { isOnline })
  return response.data.data
}

export { changeDriverStatus, getDriverDetail }
