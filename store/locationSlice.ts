import { LatLng } from 'react-native-maps'
import { create } from 'zustand'

interface LocationState {
  driverLocation: LatLng
  setDriverLocation: (latLng: LatLng) => void
}

const useLocation = create<LocationState>((set) => ({
  driverLocation: { latitude: 0, longitude: 0 },
  setDriverLocation: (latLng: LatLng) =>
    set(() => ({ driverLocation: latLng })),
}))

export default useLocation
