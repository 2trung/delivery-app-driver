import { OrderResponse, Stage } from '@/types/type'
import { create } from 'zustand'

interface OrderState {
  stage: Stage
  order: OrderResponse | null
  setOrder: (order: OrderResponse | null) => void
  setStage: (stage: Stage) => void
}

const useOrder = create<OrderState>((set) => ({
  stage: Stage.IDLE,
  order: null,
  setOrder: (order) => {
    if (order) {
      order?.locations?.sort((a, b) => a.sequence - b.sequence)
    }
    set(() => ({ order }))
  },
  setStage: (stage) => set(() => ({ stage })),
}))

export default useOrder
