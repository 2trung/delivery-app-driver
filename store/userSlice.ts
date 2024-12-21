import { Driver, DriverStatus, User } from '@/types/type'
import { create } from 'zustand'

type UserStore = {
  user: User | null
  driver: Driver
  setUser: (user: User) => void
  setDriver: (driver: Driver) => void
  logout: () => void
}

const createUser = create<UserStore>((set) => ({
  user: null,
  driver: {
    user: {
      id: '',
      name: '',
      phoneNumber: '',
      email: '',
      dob: new Date(),
    },
    licensePlate: '',
    vehicleModel: '',
    idNumber: '',
    latitude: 0,
    longitude: 0,
    rating: 0,
    ratingCount: 0,
    orderCount: 0,
    successOrderCount: 0,
    status: DriverStatus.OFFLINE,
    lastOnline: new Date(),
    id: '',
  },
  setUser: (user) => {
    set(() => ({ user }))
  },
  setDriver: (driver) => {
    set(() => ({ driver }))
  },
  logout: () => {
    set(() => ({ user: null }))
  },
}))

export default createUser
