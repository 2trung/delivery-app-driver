import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  ToastAndroid,
  Linking,
  Alert,
} from 'react-native'
import SwipeButton from 'rn-swipe-button'
import useOrder from '@/store/orderSlice'
import { useEffect } from 'react'
import { updateOrderStatus } from '@/api/orderAPI'
import { OrderStatus, OrderType, Stage } from '@/types/type'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
const OrderProccessingModal = () => {
  const { order, setOrder, setStage } = useOrder()
  const router = useRouter()
  const { isPending, mutate: updateOrderStatusMutate } = useMutation({
    mutationFn: () => {
      if (order) {
        if (order.locationSequence === order.locations.length) {
          return updateOrderStatus(
            order.id,
            OrderStatus.COMPLETED,
            order.locationSequence
          )
        }
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
      if (data.status === OrderStatus.COMPLETED) {
        return setStage(Stage.REVIEW)
      }
      return setStage(Stage.PROCESSING)
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
    <View style={styles.container}>
      {order?.orderType === OrderType.DELIVERY ? (
        <View style={styles.userDetailContainer}>
          <Text style={styles.userName}>
            {order?.deliveryOrderDetail?.receiverName}
          </Text>
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
      ) : (
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
              onPress={() => Linking.openURL(`tel:${order?.user.phoneNumber}`)}
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
      )}
      <View style={styles.horizontalDivider} />
      <View style={styles.addressContainer}>
        <View style={styles.iconContainer}>
          <MaterialIcons name='location-on' size={16} color='#fff' />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.address1} numberOfLines={1}>
            {order?.locations[order.locationSequence - 1]?.addressLine1}
          </Text>
          <Text style={styles.address2} numberOfLines={2}>
            {order?.locations[order.locationSequence - 1]?.addressLine2}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.navigationIcon}
          onPress={() => {
            openGoogleMaps(
              order?.locations[order.locationSequence - 1].latitude ?? 0,
              order?.locations[order.locationSequence - 1].longitude ?? 0
            )
          }}
        >
          <MaterialCommunityIcons
            name='navigation-variant'
            size={24}
            color='#fff'
          />
        </TouchableOpacity>
      </View>

      <View style={styles.horizontalDivider} />
      {/* <TouchableOpacity style={styles.confirmButton}>
        <Text style={styles.buttonTitle}>Đã đến điểm đón</Text>
      </TouchableOpacity> */}
      <SwipeButton
        thumbIconBackgroundColor={'#009112'}
        title={
          order?.locationSequence === (order?.locations?.length ?? 0) - 1
            ? 'Đã đến điểm dừng'
            : 'Kết thúc chuyến đi'
        }
        // thumbIconHeight={10}
        onSwipeSuccess={() => updateOrderStatusMutate()}
        titleColor={'#009112'}
        railBorderColor={'#009112'}
        thumbIconBorderColor={'#fff'}
        railBackgroundColor={'#fff'}
        railFillBackgroundColor={'#fff'}
        railFillBorderColor={'#fff'}
        thumbIconWidth={70}
        resetAfterSuccessAnimDelay={100}
        shouldResetAfterSuccess
        thumbIconComponent={() => (
          <MaterialCommunityIcons
            name='chevron-double-right'
            size={24}
            color='#fff'
          />
        )}
      />
    </View>
  )
}

export default OrderProccessingModal

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 20,
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
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F96B00',
    paddingVertical: 4,
    borderRadius: 100,
    width: 24,
    height: 24,
  },
  address1: { fontSize: 18, fontWeight: 'bold' },
  address2: { fontSize: 16, color: '#646464' },
  horizontalDivider: {
    borderBottomWidth: 1,
    marginVertical: 16,
    borderColor: '#F0EFEF',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  navigationIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#0081A1',
  },
  userDetailContainer: {
    // paddingHorizontal: 16,
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
})
