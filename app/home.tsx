import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
  ToastAndroid,
} from 'react-native'
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps'
import { customMapStyle } from '@/utils/mapStyle'
import useLocation from '@/store/locationSlice'
import { useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActivityIndicator, Switch } from 'react-native-paper'
import stompClient from '@/utils/stompClient'
import { useRouter } from 'expo-router'
import NewOrderModal from '@/components/NewOrderModal'
import useUser from '@/store/userSlice'
import useOrder from '@/store/orderSlice'
import { useMutation, useQuery } from '@tanstack/react-query'
import { changeDriverStatus } from '@/api/driverAPI'
import { DriverStatus, OrderStatus, OrderType, Stage } from '@/types/type'
import DriverDetailBottomSheet from '@/components/DriverDetailBottomSheet'
import PickingUpBottomSheet from '@/components/PickingUpBottomSheet'
import OrderProccessingModal from '@/components/OrderProccessingModal'
import InvoiceModal from '@/components/InvoiceModal'
import { getRoute } from '@/api/orderAPI'
import { icons } from '@/constants'

const Home = () => {
  const destinationPin = [
    icons.destinationPin1,
    icons.destinationPin2,
    icons.destinationPin3,
  ]
  const { user, driver, setDriver } = useUser()
  const { order, stage, setStage } = useOrder()
  const mapRef = useRef<MapView>(null)
  const { driverLocation } = useLocation()
  const [location, setLocation] = useState<LatLng>()
  const [heading, setHeading] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [orderId, setOrderId] = useState<string>()

  const { isPending: changeStatusPending, mutate: changeStatusMutate } =
    useMutation({
      mutationFn: () => {
        return changeDriverStatus(driver.status === DriverStatus.OFFLINE)
      },
      onSuccess: (data) => {
        setDriver(data)
      },
      onError: (error) => {
        ToastAndroid.show(error.message, ToastAndroid.LONG)
      },
    })

  const sendLocation = (latLng: LatLng) => {
    if (!stompClient) {
      console.log('STOMP client not connected')
      return
    }
    stompClient.publish({
      destination: '/app/location',
      body: JSON.stringify({
        latitude: latLng.latitude,
        longitude: latLng.longitude,
      }),
    })
  }

  useEffect(() => {
    stompClient.activate()
    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/driver/' + user?.id, (message) => {
        const byteArray = new Uint8Array(message.binaryBody)
        const decoder = new TextDecoder('utf-8')
        const decodedOrderId = decoder.decode(byteArray)
        setStage(Stage.NEW_ORDER)
        setOrderId(decodedOrderId)
      })
      return () => {
        stompClient.deactivate()
      }
    }

    const getLocationAndHeading = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation.coords)
          if (driver.status === DriverStatus.ONLINE)
            sendLocation(newLocation.coords)
        }
      )
      // const headingSubscription = await Location.watchHeadingAsync(
      //   (headingData) => {
      //     setHeading(headingData.trueHeading)
      //   }
      // )

      // return () => {
      //   headingSubscription.remove()
      // }
    }

    getLocationAndHeading()
  }, [])

  const showUserLocation = () => {
    if (location) {
      mapRef.current?.animateCamera({
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        zoom: 15,
      })
    }
  }

  const { data: routeData, refetch } = useQuery({
    queryKey: ['route'],
    queryFn: () => {
      if (
        !order ||
        order?.status === OrderStatus.PENDING ||
        order.status === OrderStatus.WAITING_FOR_ACCEPTANCE
      )
        return null
      return getRoute(
        location as LatLng,
        order?.locations.find(
          (location) => location.sequence === order.locationSequence
        ) as LatLng,
        [],
        OrderType.RIDE
      )
    },
    enabled: !!order,
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(intervalId)
  }, [refetch, stage])

  return (
    <GestureHandlerRootView>
      <View
        style={{
          position: 'absolute',
          top: 40,
          paddingHorizontal: 20,
          zIndex: 1,
        }}
      >
        <View style={styles.headingContainer}>
          <TouchableOpacity style={styles.headingSideButton}>
            <Ionicons name='wallet-outline' size={24} color='black' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headingSideButton}>
            <Ionicons name='settings-outline' size={24} color='black' />
          </TouchableOpacity>
        </View>
        {modalVisible && (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              elevation: 5,
              marginTop: 10,
              // paddingVertical: 5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,

                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontWeight: '600' }}>Tự động nhận cuốc:</Text>
              <Switch
                color='green'
                // trackColor={{ false: '#767577', true: '#81b0ff' }}
                // thumbColor={'#f4f3f4'}
                value={true}
              />
            </View>

            <View
              style={{
                backgroundColor: '#F4F4F4',
                margin: 10,
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: '600', marginBottom: 10 }}>
                Nhóm dịch vụ:
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text>Chở khách:</Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={'#f4f3f4'}
                  // value={true}
                />
              </View>
              <View style={styles.dividerLine} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text>Giao đồ ăn:</Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={'#f4f3f4'}
                  // value={true}
                />
              </View>
              <View style={styles.dividerLine} />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text>Giao hàng:</Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={'#f4f3f4'}
                  // value={true}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <MapView
        style={styles.map}
        customMapStyle={customMapStyle}
        showsCompass={false}
        ref={mapRef}
        showsUserLocation={true}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            rotation={heading}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
          >
            <Image
              source={require('@/assets/logos/motobike_icon.png')}
              style={{
                width: 30,
                height: 50,
              }}
              resizeMode='contain'
            />
          </Marker>
        )} */}
        {order?.locations &&
          order?.status !== OrderStatus.WAITING_FOR_ACCEPTANCE &&
          order?.status !== OrderStatus.PENDING && (
            <>
              <Marker
                coordinate={
                  order.locations.find(
                    (location) => location.sequence === 1
                  ) as LatLng
                }
              >
                {order.orderType === OrderType.FOOD_DELIVERY ? (
                  <Image
                    source={icons.restaurantPin}
                    style={{ height: 28, width: 24 }}
                  />
                ) : (
                  <Image
                    source={icons.originPin}
                    style={styles.customImageMarker}
                  />
                )}
              </Marker>
              {order?.locations.length === 2 && (
                <Marker
                  coordinate={
                    order?.locations.find(
                      (location) => location.sequence === 2
                    ) as LatLng
                  }
                >
                  <Image
                    source={icons.destinationPin}
                    style={styles.customImageMarker}
                  />
                </Marker>
              )}
              {order?.locations &&
                order.locations.length > 2 &&
                order?.locations
                  .filter((item) => item.sequence !== 1)
                  .map((item, index) => (
                    <Marker key={index} coordinate={item as LatLng}>
                      <Image
                        source={destinationPin[item.sequence - 1]}
                        style={styles.customImageMarker}
                      />
                    </Marker>
                  ))}
            </>
          )}

        {routeData?.path && (
          <Polyline
            coordinates={routeData.path.map((node: any) => ({
              latitude: node.latitude,
              longitude: node.longitude,
            }))}
            strokeColor='#00aa13'
            strokeWidth={4}
            geodesic
          />
        )}
      </MapView>

      <Pressable
        style={{ position: 'absolute', bottom: 100, right: 20 }}
        onPress={showUserLocation}
      >
        <MaterialIcons
          name='my-location'
          size={30}
          color='black'
          style={{
            backgroundColor: 'white',
            borderRadius: 100,
            elevation: 5,
            padding: 10,
          }}
        />
      </Pressable>

      <Pressable
        style={[
          driver.status !== DriverStatus.OFFLINE
            ? styles.onlineButton
            : styles.offlineButton,
        ]}
        disabled={changeStatusPending}
        onPress={() => changeStatusMutate()}
      >
        {changeStatusPending ? (
          <ActivityIndicator
            color={driver.status !== DriverStatus.OFFLINE ? 'white' : 'black'}
          />
        ) : (
          <Ionicons
            name='power-sharp'
            size={30}
            color={driver.status !== DriverStatus.OFFLINE ? 'white' : 'black'}
          />
        )}
      </Pressable>

      {stage === Stage.IDLE && <DriverDetailBottomSheet />}
      {stage === Stage.NEW_ORDER && orderId && (
        <NewOrderModal orderId={orderId} />
      )}
      {stage === Stage.PROCESSING &&
        (order && order.locationSequence === 1 ? (
          <PickingUpBottomSheet />
        ) : (
          <OrderProccessingModal />
        ))}
      {stage === Stage.REVIEW && orderId && <InvoiceModal />}
    </GestureHandlerRootView>
  )
}

export default Home

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  headingContainer: {
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headingSideButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 100,
    elevation: 10,
  },

  dividerLine: {
    borderTopColor: '#dfdfdf',
    borderTopWidth: 0.5,
    // marginVertical: 20,
  },
  onlineButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 50,
    height: 70,
    width: 70,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    elevation: 5,
  },
  offlineButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    padding: 10,
    borderRadius: 50,
    height: 70,
    width: 70,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    elevation: 5,
  },
  address1: { fontSize: 16, fontWeight: 'bold' },
  address2: { fontSize: 14, color: '#646464' },
  customImageMarker: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
})
