import axios from '@/utils/axiosInstance'
import {
  OrderResponse,
  OrderStatus,
  OrderType,
  Route,
  Weight,
} from '@/types/type'
import { LatLng } from 'react-native-maps'

const getOrderDetail = async (orderId: string): Promise<OrderResponse> => {
  const response = await axios.get('/order', { params: { orderId } })
  return response.data.data
}

const acceptOrder = async (orderId: string) => {
  const response = await axios.post('/order/accept', { orderId })
  return response.data.data
}

const rejectOrder = async (orderId: string) => {
  const response = await axios.post('/order/reject', { orderId })
  return response.data.data
}

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  locationSequence: number
): Promise<OrderResponse> => {
  const response = await axios.put(`/order/${orderId}`, {
    status,
    locationSequence,
  })
  return response.data.data
}
const cancelOrder = async (orderId: string) => {
  const response = await axios.post('/order/cancel', { orderId })
  return response.data.data
}

const getMessages = async (orderId: string) => {
  const response = await axios.get('/chat/' + orderId)
  return response.data.data
}

const getRoute = async (
  origin: LatLng,
  destination: LatLng,
  stops: LatLng[],
  orderType: OrderType,
  productSize?: Weight
): Promise<Route> => {
  const response = await axios.post('/route', {
    origin,
    destination,
    stops,
    orderType,
    productSize,
  })
  return response.data.data
}
export {
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  cancelOrder,
  getMessages,
  getRoute,
}
