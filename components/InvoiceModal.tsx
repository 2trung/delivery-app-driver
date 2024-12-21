import React from 'react'
import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import useOrder from '@/store/orderSlice'
import { Stage } from '@/types/type'
import formatDate from '@/constants/formatDate'
import { useState } from 'react'
const { width } = Dimensions.get('window')
const InvoiceModal = () => {
  const router = useRouter()
  const [star, setStar] = useState(5)
  const { order, setOrder } = useOrder()
  const { setStage } = useOrder()
  return (
    <Modal statusBarTranslucent>
      <SafeAreaView
        style={{
          height: '100%',
          paddingHorizontal: 16,
          backgroundColor: '#F2F2F4',
        }}
      >
        <View style={styles.arc} />
        <Text
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: '600',
            alignSelf: 'center',
            paddingVertical: 24,
          }}
        >
          Kết thúc chuyến đi
        </Text>
        <View style={{ gap: 20 }}>
          <View
            style={{
              backgroundColor: '#fff',
              padding: 18,
              borderRadius: 20,
              gap: 15,
            }}
          >
            <View
              style={{
                height: 32,
                width: 32,
                backgroundColor: '#00880C',
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                position: 'absolute',
                top: -16,
                borderWidth: 2,
                borderColor: '#fff',
              }}
            >
              <FontAwesome6 name='check' size={18} color='#fff' />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '500' }}>
              {order?.orderType === 'RIDE'
                ? 'Chở khách'
                : order?.orderType === 'FOOD_DELIVERY'
                ? 'Giao đồ ăn'
                : 'Giao hàng'}
            </Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ color: '#646363', fontSize: 16 }}>
                {formatDate(order?.createdAt ?? '')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <Text style={{ color: '#646363', fontSize: 16 }}>
                  {order?.id.slice(0, 6) + '...'}
                </Text>
                <Ionicons name='copy' size={16} color='#646363' />
              </View>
            </View>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={{ fontSize: 16 }}>Phương thức thanh toán</Text>
            <View
              style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
            >
              {order?.paymentMethod === 'CASH' ? (
                <>
                  <MaterialCommunityIcons
                    name='cash-multiple'
                    size={24}
                    color='#0aafd9'
                  />
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>
                    Tiền mặt
                  </Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name='credit-card' size={24} color='#0aafd9' />
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>Thẻ</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.paymentContainer}>
            <View style={styles.paymentDetail}>
              <Text style={{ fontSize: 16 }}>Cước phí</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {order?.cost.toLocaleString('vi')} đ
              </Text>
            </View>
            <View style={styles.paymentDetail}>
              <Text style={{ fontSize: 16 }}>Khuyến mãi</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>0đ</Text>
            </View>
            <View style={styles.horizontalDivider} />
            <View style={styles.paymentDetail}>
              <Text style={{ fontSize: 16 }}>Thu tiền mặt</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {order?.paymentMethod === 'CASH'
                  ? order?.cost.toLocaleString('vi')
                  : 0}{' '}
                đ
              </Text>
            </View>
          </View>
          <View
            style={{
              padding: 18,
              backgroundColor: '#fff',
              borderRadius: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Đánh giá chuyến đi
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Ionicons
                name='star'
                size={36}
                color={star >= 1 ? '#00880C' : '#D3D3D3'}
                onPress={() => setStar(1)}
              />
              <Ionicons
                name='star'
                size={36}
                color={star >= 2 ? '#00880C' : '#D3D3D3'}
                onPress={() => setStar(2)}
              />
              <Ionicons
                name='star'
                size={36}
                color={star >= 3 ? '#00880C' : '#D3D3D3'}
                onPress={() => setStar(3)}
              />
              <Ionicons
                name='star'
                size={36}
                color={star >= 4 ? '#00880C' : '#D3D3D3'}
                onPress={() => setStar(4)}
              />
              <Ionicons
                name='star'
                size={36}
                color={star >= 5 ? '#00880C' : '#D3D3D3'}
                onPress={() => setStar(5)}
              />
            </View>
            <TextInput
              placeholder='Để lại bình luận'
              placeholderTextColor={'#BABABA'}
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: '#F0EFEF',
                borderRadius: 20,
                width: '100%',
                padding: 16,
                marginTop: 20,
                justifyContent: 'flex-start',
                textAlignVertical: 'top',
              }}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setStage(Stage.IDLE)
            router.navigate('/home')
            setOrder(null)
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            backgroundColor: '#00880C',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            borderRadius: 20,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: '600' }}>
            Xong
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  )
}

export default InvoiceModal

const styles = StyleSheet.create({
  paymentContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
  },
  paymentDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingVertical: 8,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
  },
  horizontalDivider: {
    borderBottomWidth: 1,
    marginVertical: 16,
    borderColor: '#F0EFEF',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  arc: {
    width: width * 2,
    height: width * 2,
    backgroundColor: '#00880C',
    borderRadius: width * 2,
    position: 'absolute',
    top: -width * 2 + 180,
    left: -width / 2,
    // zIndex: 1,
  },
})
