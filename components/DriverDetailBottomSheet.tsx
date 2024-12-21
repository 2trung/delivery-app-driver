import {
  AntDesign,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { View, StyleSheet, Image, Text } from 'react-native'
import { getDriverDetail } from '@/api/driverAPI'
import { useQuery } from '@tanstack/react-query'
import useUser from '@/store/userSlice'
import { useEffect } from 'react'
import { DriverStatus } from '@/types/type'

const DriverDetailBottomSheet = () => {
  const { user, driver, setDriver } = useUser()
  const {
    data: driverDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['driverDetail', user?.id],
    queryFn: () => {
      const saveDriverDetail = async () => {
        if (user?.id) {
          const driverDetail = await getDriverDetail(user.id)
          setDriver(driverDetail)
          return driverDetail
        } else throw new Error('User not found')
      }
      return saveDriverDetail()
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (driverDetail) {
      setDriver(driverDetail)
    }
  }, [driverDetail])

  return (
    <BottomSheet snapPoints={[90]} style={{ elevation: 10 }}>
      <BottomSheetView style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            // justifyContent: 'space-between',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 10,
            marginBottom: 16,
          }}
        >
          <View style={styles.onlineStatusContainer}>
            <View
              style={
                driver.status !== DriverStatus.OFFLINE
                  ? styles.onlineStatusIcon
                  : styles.offlineStatusIcon
              }
            />
            <Text style={{ fontSize: 20, fontWeight: '500' }}>
              {driver.status !== DriverStatus.OFFLINE
                ? 'Đang trực tuyến'
                : 'Đang ngoại tuyến'}
            </Text>
          </View>
          <View
            style={{
              position: 'absolute',
              right: 10,
            }}
          >
            <FontAwesome6 name='sliders' size={20} color='black' />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // gap: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Image
              source={require('@/assets/images/default-driver.png')}
              style={{ width: 70, height: 70 }}
            />
            <View style={{ gap: 5 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                }}
              >
                {driverDetail?.user.name}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <AntDesign name='staro' size={18} color='green' />
                <Text style={{ color: 'green' }}>{driverDetail?.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dividerLine} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center', gap: 5 }}>
            <AntDesign name='checksquare' size={24} color='green' />
            <Text style={{ fontWeight: '600', fontSize: 18 }}>
              {driverDetail?.orderCount
                ? (
                    (driverDetail.successOrderCount / driverDetail.orderCount) *
                    100
                  ).toPrecision(3)
                : 0}
              %
            </Text>
            <Text style={{ color: '#BABABA' }}>Hoàn thành</Text>
          </View>

          <View style={{ alignItems: 'center', gap: 5 }}>
            <View
              style={{
                backgroundColor: 'green',
                padding: 3,
                borderRadius: 50,
                width: 25,
                height: 25,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name='star' size={18} color='#fff' />
            </View>
            <Text style={{ fontWeight: '600', fontSize: 18 }}>
              {driverDetail?.rating}
            </Text>
            <Text style={{ color: '#BABABA' }}>Đánh giá</Text>
          </View>

          <View style={{ alignItems: 'center', gap: 5 }}>
            <MaterialCommunityIcons
              name='close-octagon'
              size={24}
              color='green'
            />
            <Text style={{ fontWeight: '600', fontSize: 18 }}>
              {driverDetail?.orderCount
                ? (
                    100 -
                    (driverDetail.successOrderCount / driverDetail.orderCount) *
                      100
                  ).toPrecision(3)
                : 0}
              %
            </Text>
            <Text style={{ color: '#BABABA' }}>Huỷ đơn</Text>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default DriverDetailBottomSheet

const styles = StyleSheet.create({
  onlineStatusContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  onlineStatusIcon: {
    height: 10,
    width: 10,
    backgroundColor: 'green',
    borderRadius: 20,
  },
  offlineStatusIcon: {
    height: 10,
    width: 10,
    backgroundColor: 'red',
    borderRadius: 20,
  },
  dividerLine: {
    borderTopColor: '#dfdfdf',
    borderTopWidth: 0.5,
    marginVertical: 20,
  },
})
