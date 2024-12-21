import React from 'react'
import {
  Modal,
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native'
import { images, icons } from '@/constants'
import {
  Foundation,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useRef, useState } from 'react'
import { getOrderDetail, acceptOrder, rejectOrder } from '@/api/orderAPI'
import { useMutation, useQuery } from '@tanstack/react-query'
import useOrder from '@/store/orderSlice'
import { OrderType, Stage } from '@/types/type'

const NewOrderModal = ({ orderId }: { orderId: string }) => {
  const { setOrder, setStage, order } = useOrder()
  const [countdown, setCountdown] = useState(30)
  const animatedValue = useRef(new Animated.Value(0)).current
  const destinationPin = [
    icons.destinationPin1,
    icons.destinationPin2,
    icons.destinationPin3,
  ]

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setStage(Stage.IDLE)
    }
  }, [countdown])

  const animatedStyle = {
    width: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['100%', '0%'],
    }),
  }

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 30000,
      useNativeDriver: false,
    }).start()
  }, [])

  const {
    data: orderDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => {
      if (orderId) return getOrderDetail(orderId)
    },
    enabled: !!orderId,
  })

  const { isPending, mutate: acceptMutate } = useMutation({
    mutationFn: () => {
      if (orderId) return acceptOrder(orderId)
      throw new Error('Order ID is undefined')
    },
    onSuccess: (data) => {
      setOrder(data)
      setStage(Stage.PROCESSING)
    },
    onError: (error) => {
      ToastAndroid.show(error.message, ToastAndroid.SHORT)
    },
  })

  const { mutate: rejectMutate } = useMutation({
    mutationFn: () => {
      if (orderId) return rejectOrder(orderId)
      throw new Error('Có lỗi xảy ra')
    },
    onSuccess: (data) => {
      setOrder(null)
      setStage(Stage.IDLE)
    },
  })

  useEffect(() => {
    if (orderDetail) {
      setOrder(orderDetail)
    }
  }, [orderDetail])

  const handleReject = () => {
    setStage(Stage.IDLE)
    rejectMutate()
  }
  const handleAccept = () => {
    acceptMutate()
    setStage(Stage.PROCESSING)
  }

  return (
    <Modal transparent={true} animationType='fade' statusBarTranslucent>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => handleReject()}>
            <Ionicons name='close' size={24} color='white' />
          </TouchableOpacity>
          <Text style={styles.title}>Yêu cầu mới</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <>
            <View style={styles.orderDetail1Container}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={images.rideOderBike}
                  style={{ height: 50, width: 50 }}
                />
                <Text style={{ fontWeight: '600' }}>
                  {order?.orderType === 'RIDE'
                    ? 'Chở khách'
                    : order?.orderType === 'FOOD_DELIVERY'
                    ? 'Giao đồ ăn'
                    : 'Giao hàng'}
                </Text>
              </View>
              <View
                style={{
                  borderLeftWidth: 1,
                  borderColor: '#dfdfdf',
                }}
              />
              <View style={{ gap: 5 }}>
                <Text style={{ fontWeight: '500', fontSize: 16 }}>
                  {order?.user?.name}
                </Text>
                <View style={styles.userRating}>
                  <Foundation name='star' size={16} color='#fff' />
                  <Text style={{ color: '#fff' }}>5.0</Text>
                </View>
              </View>
            </View>
            <View style={styles.orderDetail2Container}>
              <View style={styles.paymentContainer}>
                <View>
                  <Text>Thanh toán</Text>
                  <View style={styles.paymentMethod}>
                    <Text style={{ color: '#00700a' }}>
                      {order?.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Thẻ'}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderColor: '#dfdfdf',
                  }}
                />
                <View>
                  <Text>Thu nhập</Text>
                  <Text style={{ fontWeight: '600' }}>
                    {order?.orderType === OrderType.FOOD_DELIVERY
                      ? (
                          order?.cost -
                          (order?.foodOrderItems?.reduce(
                            (acc, curr) => acc + curr.total,
                            0
                          ) ?? 0)
                        ).toLocaleString('vi')
                      : order?.cost.toLocaleString('vi')}{' '}
                    đ
                  </Text>
                </View>
              </View>
              <View style={{ borderBottomWidth: 1, borderColor: '#dfdfdf' }} />
              <View style={styles.locationContainer}>
                <FontAwesome name='arrow-circle-up' size={28} color='#009112' />
                <View>
                  <Text style={styles.address1} numberOfLines={1}>
                    {
                      order?.locations?.find(
                        (location) => location.sequence === 1
                      )?.addressLine1
                    }
                  </Text>
                  <Text style={styles.address2} numberOfLines={2}>
                    {
                      order?.locations?.find(
                        (location) => location.sequence === 1
                      )?.addressLine2
                    }
                  </Text>
                </View>
              </View>
              {order?.locations?.length == 2 ? (
                <View style={styles.locationContainer}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name='location-on' size={16} color='#fff' />
                  </View>
                  <View>
                    <Text style={styles.address1} numberOfLines={1}>
                      {
                        order?.locations?.find(
                          (location) => location.sequence === 2
                        )?.addressLine1
                      }
                    </Text>
                    <Text style={styles.address2} numberOfLines={2}>
                      {
                        order?.locations?.find(
                          (location) => location.sequence === 2
                        )?.addressLine2
                      }
                    </Text>
                  </View>
                </View>
              ) : (
                order?.locations
                  ?.filter((location) => location.sequence != 1)
                  .map((location, index) => {
                    return (
                      <View style={styles.locationContainer} key={index}>
                        <Image
                          source={destinationPin[index]}
                          style={{ width: 24, height: 24 }}
                        />
                        <View>
                          <Text style={styles.address1} numberOfLines={1}>
                            {location.addressLine1}
                          </Text>
                          <Text style={styles.address2} numberOfLines={2}>
                            {location.addressLine2}
                          </Text>
                        </View>
                      </View>
                    )
                  })
              )}
            </View>
          </>
        )}

        <Pressable style={styles.confirmButton} onPress={() => handleAccept()}>
          <Animated.View style={[styles.animatedBackground, animatedStyle]} />
          {isPending ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              Nhận chuyến
            </Text>
          )}
        </Pressable>
      </SafeAreaView>
    </Modal>
  )
}

export default NewOrderModal

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    height: '100%',
    paddingHorizontal: 16,
    gap: 20,
  },
  titleContainer: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  title: { color: 'white', fontSize: 20, fontWeight: '600' },
  orderDetail1Container: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-around',
  },
  userRating: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#00880c',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  orderDetail2Container: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    gap: 10,
  },
  paymentContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-around',
  },
  paymentMethod: {
    backgroundColor: '#e0ffe0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '90%',
  },
  address1: { fontSize: 16, fontWeight: 'bold' },
  address2: { fontSize: 14, color: '#646464' },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F96B00',
    paddingVertical: 4,
    borderRadius: 100,
    width: 24,
    height: 24,
  },
  confirmButton: {
    backgroundColor: '#006400',
    paddingVertical: 16,
    // paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#009112',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: '100%',
  },
})
