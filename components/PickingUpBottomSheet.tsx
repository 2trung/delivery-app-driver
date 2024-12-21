import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  ToastAndroid,
  ActivityIndicator,
  Pressable,
  Linking,
  Alert,
} from 'react-native'
import useOrder from '@/store/orderSlice'
import { icons } from '@/constants'
import { OrderStatus, OrderType, PaymentMethod, Stage } from '@/types/type'
import { updateOrderStatus, cancelOrder } from '@/api/orderAPI'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'

const OrderProcessingBottomSheet = () => {
  const translateYValue = useRef(new Animated.Value(0)).current
  const { order, setOrder, setStage } = useOrder()
  const destinationPin = [
    icons.destinationPin1,
    icons.destinationPin2,
    icons.destinationPin3,
  ]

  const handleSheetChanges = useCallback((index: number) => {
    Animated.timing(translateYValue, {
      toValue: index === 1 ? 100 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [])

  const { isPending, mutate: updateOrderStatusMutate } = useMutation({
    mutationFn: () => {
      if (order) {
        return updateOrderStatus(
          order.id,
          OrderStatus.IN_PROGRESS,
          order.locationSequence + 1
        )
      }

      return Promise.reject(new Error('Có lỗi xảy ra'))
    },
    onSuccess: (data) => {
      setOrder(data)
      setStage(Stage.PROCESSING)
    },
    onError: (error) => {
      ToastAndroid.show(error.message, ToastAndroid.LONG)
    },
  })

  const showAlert = () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Thông báo',
        'Bạn chắc chắn muốn huỷ đơn hàng chứ?',
        [
          {
            text: 'Không',
            style: 'cancel',
            onPress: () => {
              return
            },
          },
          {
            text: 'Có',
            onPress: () => {
              cancelOrderMutate()
            },
          },
        ],
        { cancelable: false }
      )
    })
  }
  const { isPending: cancelPending, mutate: cancelOrderMutate } = useMutation({
    mutationFn: () => {
      if (order) {
        return cancelOrder(order.id)
      }
      return Promise.reject(new Error('Không tìm thấy đơn hàng'))
    },
    onSuccess: (data) => {
      ToastAndroid.show('Huỷ đơn hàng thành công', ToastAndroid.LONG)
      setStage(Stage.IDLE)
    },
    onError: (error) => {
      ToastAndroid.show(error.message, ToastAndroid.LONG)
    },
  })
  const openGoogleMaps = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving&dirflg=b`
    Linking.openURL(url).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở Google Maps.')
    })
  }
  return (
    <>
      <BottomSheet
        snapPoints={[280]}
        onChange={handleSheetChanges}
        style={{ zIndex: 2 }}
      >
        <BottomSheetScrollView style={styles.contentContainer}>
          <View style={styles.userDetailContainer}>
            <View style={{ gap: 5 }}>
              <Text style={styles.userName}>{order?.user.name}</Text>
              <View style={styles.rating}>
                <AntDesign name='star' size={16} color='#4A4A4A' />
                <Text style={{ color: '#4A4A4A' }}>4.9 (82)</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.callIconContainer}
                onPress={() =>
                  Linking.openURL(`tel:${order?.user.phoneNumber}`)
                }
              >
                <Ionicons name='call' size={18} color='#fff' />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.callIconContainer}
                onPress={() => router.push('/chat')}
              >
                <MaterialIcons name='message' size={18} color='#fff' />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.horizontalDivider} />
          <View style={styles.originContainer}>
            <View style={styles.addressContainer}>
              {order?.orderType === OrderType.FOOD_DELIVERY ? (
                <Image
                  source={icons.restaurantPin}
                  style={{ height: 28, width: 24 }}
                />
              ) : (
                <FontAwesome name='arrow-circle-up' size={28} color='#009112' />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.address1} numberOfLines={1}>
                  {order?.locations[0].addressLine1}
                </Text>
                <Text style={styles.address2} numberOfLines={2}>
                  {order?.locations[0].addressLine2}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.navigationIcon}
              onPress={() =>
                openGoogleMaps(
                  order?.locations[0].latitude ?? 0,
                  order?.locations[0].longitude ?? 0
                )
              }
            >
              <MaterialCommunityIcons
                name='navigation-variant'
                size={24}
                color='#fff'
              />
            </TouchableOpacity>
          </View>
          {order?.orderType === OrderType.FOOD_DELIVERY && (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`tel:${order?.user.phoneNumber}`)
                }
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 100,
                  gap: 5,
                  // paddingVertical: 50,
                }}
              >
                <Ionicons name='call-outline' size={24} color='black' />
                <Text>Liên hệ nhà hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 100,
                  gap: 5,
                  // paddingVertical: 50,
                }}
              >
                <AntDesign name='infocirlceo' size={22} color='black' />
                <Text>Chi tiết đơn hàng</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.orderDetailTitle}>Điểm đến</Text>
          <View style={styles.destinationContainer}>
            {order?.locations?.length == 2 ? (
              <View>
                <View style={styles.addressContainer}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name='location-on' size={16} color='#fff' />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.address1} numberOfLines={1}>
                      {order?.locations[1].addressLine1}
                    </Text>
                    <Text style={styles.address2} numberOfLines={2}>
                      {order?.locations[1].addressLine2}
                    </Text>
                  </View>
                </View>
                {order?.orderType === OrderType.DELIVERY && (
                  <>
                    <View style={styles.horizontalDivider} />
                    <View
                      style={{
                        ...styles.userDetailContainer,
                        paddingTop: 10,
                      }}
                    >
                      <View style={{ gap: 5 }}>
                        <Text style={styles.userName}>
                          {order?.deliveryOrderDetail?.receiverName}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                          style={styles.callIconContainer}
                          onPress={() =>
                            Linking.openURL(
                              `tel:${order?.deliveryOrderDetail?.receiverPhone}`
                            )
                          }
                        >
                          <Ionicons name='call' size={18} color='#fff' />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            ) : (
              order?.locations
                ?.filter((location) => location.sequence > 1)
                .map((location, index) => (
                  <View style={styles.addressContainer} key={index}>
                    <Image
                      source={destinationPin[index]}
                      style={{ width: 24, height: 24 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.address1} numberOfLines={1}>
                        {location.addressLine1}
                      </Text>
                      <Text style={styles.address2} numberOfLines={2}>
                        {location.addressLine2}
                      </Text>
                    </View>
                  </View>
                ))
            )}

            <View style={styles.horizontalDivider} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 16,
              }}
            >
              <Text>Quãng đường</Text>
              <Text>{order?.distance.toFixed(2)} km</Text>
            </View>
          </View>

          <Text style={styles.orderDetailTitle}>Thanh toán</Text>
          <View style={styles.paymentContainer}>
            <View style={styles.paymentDetail}>
              <Text>Phương thức thanh toán</Text>
              <Text>
                {order?.paymentMethod === PaymentMethod.CASH
                  ? 'Tiền mặt'
                  : 'Thẻ'}
              </Text>
            </View>
            <View style={styles.paymentDetail}>
              <Text>Cước phí</Text>
              <Text>
                {order?.orderType === OrderType.FOOD_DELIVERY
                  ? (
                      order?.cost -
                      (order?.foodOrderItems?.reduce(
                        (acc, item) => acc + item.total * item.quantity,
                        0
                      ) ?? 0)
                    ).toLocaleString('vi')
                  : order?.cost.toLocaleString('vi')}{' '}
                đ
              </Text>
            </View>
            {order?.orderType === OrderType.FOOD_DELIVERY && (
              <View style={styles.paymentDetail}>
                <Text>Giá món ăn</Text>
                <Text>
                  {order?.foodOrderItems
                    ?.reduce((acc, item) => acc + item.total * item.quantity, 0)
                    .toLocaleString('vi')}{' '}
                  đ
                </Text>
              </View>
            )}
            <View style={styles.paymentDetail}>
              <Text>Khuyến mãi</Text>
              <Text>0 đ</Text>
            </View>
            <View style={styles.paymentDetail}>
              <Text>Thu tiền mặt</Text>
              <Text>
                {order?.paymentMethod === PaymentMethod.CASH
                  ? order?.cost.toLocaleString('vi')
                  : '0'}{' '}
                đ
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'center', paddingVertical: 100 }}>
            <TouchableOpacity onPress={() => showAlert()}>
              <Text
                style={{
                  color: 'red',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Huỷ chuyến
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ translateY: translateYValue }],
          },
        ]}
      >
        <Pressable
          style={styles.confirmButton}
          onPress={() => updateOrderStatusMutate()}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color='#fff' size={24} />
          ) : (
            <Text style={styles.buttonTitle}>
              {order?.orderType === OrderType.FOOD_DELIVERY
                ? 'Đã đến nhà hàng'
                : order?.orderType === OrderType.RIDE
                ? 'Đã đến điểm đón'
                : 'Đã đến điểm lấy hàng'}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </>
  )
}

export default OrderProcessingBottomSheet

const styles = StyleSheet.create({
  contentContainer: {
    height: '100%',
    backgroundColor: '#E8EAEC',
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
  tripEstimateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  tripEstimate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#646464',
  },
  confirmButton: {
    backgroundColor: '#009112',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tripTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  additionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 5,
    marginVertical: 5,
  },
  userDetailContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  userName: { fontSize: 18, fontWeight: '500' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  callIconContainer: {
    padding: 10,
    backgroundColor: '#009112',
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  originContainer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'space-between',
  },
  horizontalDivider: {
    borderBottomWidth: 1,
    paddingTop: 16,
    borderColor: '#F0EFEF',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 60,
    flex: 1,
  },
  navigationIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#0081A1',
  },
  orderDetailTitle: { fontSize: 18, fontWeight: '500', padding: 16 },
  destinationContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  paymentContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingVertical: 10,
    gap: 15,
  },
  paymentDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonContainer: {
    width: '100%',
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 20,
  },
})
