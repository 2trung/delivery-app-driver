export interface User {
  id: string
  name: string
  phoneNumber: string
  email: string
  dob: Date
}

export interface Driver {
  user: User
  licensePlate: string
  vehicleModel: string
  idNumber: string
  latitude: number
  longitude: number
  rating: number
  ratingCount: number
  orderCount: number
  successOrderCount: number
  status: DriverStatus
  lastOnline: Date
  id: string
}
export enum DriverStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
}

export interface OrderResponse {
  id: string
  driver: Driver
  user: User
  status: OrderStatus
  createdAt: string
  cost: number
  distance: number
  paymentMethod: string
  orderType: string
  locationSequence: number
  locations: Location[]
  foodOrderItems: FoodOrderItem[] | null
  deliveryOrderDetail: DeliveryOrderDetail | null
}

export interface DeliveryOrderDetail {
  cod: number
  deliveryCost: number
  productSize: string
  productCategory: string
  note: string
  senderName: string
  senderPhone: string
  receiverName: string
  receiverPhone: string
}
export interface Location {
  addressLine1: string
  addressLine2: string
  latitude: number
  longitude: number
  locationType: LocationType
  sequence: number
}

export enum LocationType {
  PICKUP = 'PICKUP',
  DROPOFF = 'DROPOFF',
  RESTAURANT = 'RESTAURANT',
}

export interface User {
  id: string
  name: string
  phoneNumber: string
  email: string
  dob: Date
}

export interface Driver {
  user: User
  licensePlate: string
  vehicleModel: string
  idNumber: string
  latitude: number
  longitude: number
  rating: number
  ratingCount: number
  orderCount: number
  successOrderCount: number
  status: DriverStatus
  lastOnline: Date
  id: string
}

export interface FoodOrderItem {
  food: Food
  quantity: number
  total: number
  note: string
  foodOrderItemCustomizes: FoodOrderItemCustomize[]
}

export interface Food {
  price: number
  oldPrice: number
  image: string
  name: string
  orderCount: number
  likeCount: number
}

export interface FoodOrderItemCustomize {
  name: string
  foodOrderItemCustomizeOptions: FoodOrderItemCustomizeOption[]
}

export interface FoodOrderItemCustomizeOption {
  name: string
  price: number
}

export enum OrderStatus {
  PENDING = 'PENDING',
  WAITING_FOR_ACCEPTANCE = 'WAITING_FOR_ACCEPTANCE',
  ARRIVING = 'ARRIVING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum Stage {
  IDLE = 'IDLE',
  NEW_ORDER = 'NEW_ORDER',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
}

export enum OrderType {
  DELIVERY = 'DELIVERY',
  FOOD_DELIVERY = 'FOOD_DELIVERY',
  RIDE = 'RIDE',
}
export enum Weight {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}
export interface Route {
  path: Node[]
  distance: number
  duration: string
  cost: number
}
