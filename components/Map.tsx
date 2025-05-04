const mapCustomStyle = [
  {
    "elementType": "geometry", "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }]
  }
]


import { View, Text, TouchableOpacity, Keyboard, Platform, ActivityIndicator } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { Region } from 'react-native-maps'
import { useCustomer, useDriver, useDriverStore, useRideOfferStore, useWSStore } from '@/store'
import { calculateRegion, getNearbyDrivers } from '@/lib/calcRegion'
import { icons } from '@/constants/data'
import { usePathname } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons';
import { Driver } from '@/types/type'
import Constants from "expo-constants";

let MapView, Marker, PROVIDER_GOOGLE, MapViewDirections;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  MapViewDirections = require('react-native-maps-directions').default;
} else {
  MapView = () => <div>Map not available on web</div>;
  Marker = () => null;
  PROVIDER_GOOGLE = null;
  MapViewDirections = () => null;
}


type PlainDriver = Omit<Driver, 'setCarImageURL' | 'setCarSeats' | 'setUserLocation' | 'setId' | 'setProfileImageURL' | 'setRating' | 'setFullName' | 'setRole'>;

// Google Maps API Key setup
const googlePlacesApiKey = Constants.expoConfig?.extra?.googleMapsApiKey ?? "";


const Map = () => {
  const [region, setRegion] = useState<Region | undefined>(undefined);

  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useCustomer();


  const {
    userLatitude: driverLatitude,
    userLongitude: driverLongitude,
    userAddress: driverAddress,
  } = useDriver();





  const { ws, setWebSocket } = useWSStore();




  const path = usePathname();

  const isDriverUI = (path === '/find-customer' || path === 'finish-ride') ? true : false;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  // const [driverDestination, setDriverDestination] = useState<string>('')
  const [driverPickupLatitude, setDriverPickupLatitude] = useState<number>();
  const [driverPickupLongitude, setDriverPickupLongitude] = useState<number>()
  const [driverDropoffLatitude, setDriverDropoffLatitude] = useState<number>();
  const [driverDropoffLongitude, setDriverDropoffLongitude] = useState<number>()
  const [rideStatus, setRideStatus] = useState<string>('offer')
  // const [markers, setMarkers] = useState<(PlainDriver)[]>([]);
  const mapRef = useRef<any>(null);
  const lastLocationRef = useRef<{ lat: number, lng: number } | null>(null);

  console.log('driverPickupLatitude from path', path)
  console.log(userLatitude)


  const {
    selectedDriverId,
    setDrivers,
    drivers,
    setNearbyDrivers,
    updateDriverLocation,
    nearbyDrivers,
    removeDriverLocation,
    removeNearbyDriver,
    selectedDriverDetails,
    updateSelectedDriverLocation,
    addNearbyDrivers,
    giveRiderDetails
  } = useDriverStore();


  const {
    addRideOffer,
    removeRideOffer,
    rideOffer,
    giveRideDetails,
    activeRideId
  } = useRideOfferStore()



  useEffect(() => {
    const find_destination = () => {
      const details = giveRideDetails(activeRideId!)
      setDriverPickupLatitude(details?.pickupDetails.pickupLatitude);
      setDriverPickupLongitude(details?.pickupDetails.pickupLongitude);
      setDriverDropoffLatitude(details?.dropoffDetails.dropoffLatitude)
      setDriverDropoffLongitude(details?.dropoffDetails.dropoffLongitude)
      setRideStatus(details?.status as string)
    }

    if (activeRideId) {
      find_destination();
    }
  }, [activeRideId])

  const longitude = userLongitude ?? driverLongitude;
  const latitude = userLatitude ?? driverLatitude;

  const driverOriginLatitude = rideStatus === 'offer' ? driverLatitude : driverPickupLatitude;
  const driverOriginLongitude = rideStatus === 'offer' ? driverLongitude : driverPickupLongitude;
  const driverDestinationLatitude = rideStatus === 'offer' ? driverPickupLatitude : driverDropoffLatitude;
  const driverDestinationLongitude = rideStatus === 'offer' ? driverPickupLongitude : driverDropoffLongitude;

  const customerDestinationLatitude = rideStatus === 'offer' ? driverLatitude : destinationLatitude;
  const customerDestinationLongitude = rideStatus === 'offer' ? driverLongitude : destinationLongitude;

  console.log(rideStatus)
  console.log(rideStatus)

  const [markers, setMarkers] = useState(nearbyDrivers)

  // const selectedDriverDetails = nearbyDrivers?.find(
  //   (driver) => driver.id === selectedDriverId,
  // );

  console.log('selected driver details', selectedDriverDetails)
  console.log('selected driver details', !selectedDriverDetails)


  useEffect(() => {
    let socket: WebSocket;

    // Either create a new one or use existing one
    if (!ws) {
      const newWs = new WebSocket('wss://websocket-server-for-glidex.onrender.com');

      newWs.onopen = () => {
        console.log('WebSocket connected');
      };

      newWs.onerror = (err) => {
        console.log('WebSocket error:', err);
      };

      setWebSocket(newWs);
      socket = newWs;
    } else {
      socket = ws;
    }

    // Attach onmessage regardless
    socket.onmessage = (event) => {
      console.log('Message received from WebSocket:');
      console.log(event.data)
      const message = JSON.parse(event.data);
      console.log('📍Parsed message:');
      console.log(message)
      if (message.type === 'riderLocationUpdated') {
        console.log('📍 Rider location update:', message);
        updateDriverLocation(message.driverId, message.latitude, message.longitude, message.address)
        updateSelectedDriverLocation(message.latitude, message.longitude, message.address)



        const updatedDrivers = useDriverStore.getState().nearbyDrivers?.filter(
          (driver) => driver.userLatitude && driver.userLongitude
        ) || [];

        updateMarkersOnMap(updatedDrivers);
      }
      if (message.type === 'riderLocationUpdate') {
        console.log('📍 Rider location update:', message);
        updateDriverLocation(message.driverId, message.latitude, message.longitude, message.address)
        updateSelectedDriverLocation(message.latitude, message.longitude, message.address)
      }

      if (message.type === 'rideBegins') {
        setRideStatus('Start');
      }

      if (message.type === 'driverOffline') {
        removeDriverLocation(message.driverId)
        removeNearbyDriver(message.driverId)

        const updatedDrivers = useDriverStore.getState().nearbyDrivers

        updateMarkersOnMap(updatedDrivers);
      }

      if (message.type === 'driverOnDuty') {
        const riderDetails = giveRiderDetails(message.id);
        if (riderDetails !== undefined) {
          addNearbyDrivers(riderDetails);
        }
      }
    };

    // return () => {
    //   if (socket) {
    //     socket.close();
    //     console.log('WebSocket closed');
    //   }
    // };
  }, [ws]);

  const updateMarkersOnMap = async (driversToUse?: PlainDriver[]) => {
    if (userLatitude && userLongitude) {
      let driversWithDistanceAway: PlainDriver[] = [];
      const driversToPass = driversToUse ?? nearbyDrivers;

      if (destinationLatitude && destinationLongitude) {
        driversWithDistanceAway = await getNearbyDrivers(userLatitude, userLongitude, driversToPass, destinationLatitude, destinationLongitude);
      } else {
        driversWithDistanceAway = await getNearbyDrivers(userLatitude, userLongitude, driversToPass);
      }


      // console.log('drivers with distance away')
      // console.log(driversWithDistanceAway)
      setNearbyDrivers(driversWithDistanceAway)
      setMarkers(driversWithDistanceAway)
    }
  }

  useEffect(() => {
    const updateRegion = () => {
      if (!isDriverUI) {
        // Customer UI: Focus on user's location (or customer’s current location if set)
        const startLatitude = userLatitude;
        const startLongitude = userLongitude;
        const endLatitude = destinationLatitude;
        const endLongitude = destinationLongitude;

        if (startLatitude && startLongitude) {
          const region = calculateRegion({
            userLatitude: startLatitude,
            userLongitude: startLongitude,
            destinationLatitude: endLatitude,
            destinationLongitude: endLongitude,
          });
          setRegion(region);
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 1000);
          }
        }
      }

      if (isDriverUI) {
        // Driver UI: Focus on the driver’s location
        const startLatitude = driverLatitude;
        const startLongitude = driverLongitude;
        const endLatitude = userLatitude; // Customer’s pickup location
        const endLongitude = userLongitude;

        if (startLatitude && startLongitude) {
          const region = calculateRegion({
            userLatitude: startLatitude,
            userLongitude: startLongitude,
            destinationLatitude: endLatitude,
            destinationLongitude: endLongitude,
          });
          setRegion(region);
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 1000);
          }
        }
      }
    };

    updateRegion();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude, rideStatus, driverLatitude, driverLongitude, userLatitude, userLongitude]);



  useEffect(() => {
    if (rideStatus === 'Start' &&
      driverDropoffLatitude && driverDropoffLongitude && driverPickupLongitude && driverPickupLatitude) {
      // Perform necessary actions when ride status changes to 'start'
      console.log("Ride status is 'start', updating the map.");
      // Example: Trigger a region update to a new region (you can adjust the logic as per the app needs)
      const newRegion = calculateRegion({
        userLongitude: driverPickupLongitude, //driverLongitude
        userLatitude: driverPickupLatitude, //driverLatitude
        destinationLatitude: driverDropoffLatitude,
        destinationLongitude: driverDropoffLongitude,
      });
      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);  // Smooth transition to the new region
      }
    }
  }, [rideStatus, driverLongitude, driverLatitude, driverDropoffLatitude, driverDropoffLongitude]);  // Depend on rideStatus for changes


  useEffect(() => {
    if (rideStatus === 'Start' && driverPickupLongitude && driverPickupLatitude) {
      console.log("Ride status is 'start', updating the map.");
      const newRegion = calculateRegion({
        userLongitude: driverPickupLongitude,
        userLatitude: driverPickupLatitude,
        destinationLatitude: driverDropoffLatitude,
        destinationLongitude: driverDropoffLongitude,
      });
      setRegion(newRegion);  // Update the region state
    }
  }, [rideStatus, driverPickupLongitude, driverPickupLatitude, driverDropoffLongitude, driverDropoffLatitude]);




  console.log('enarby drivers')
  console.log(nearbyDrivers)

  useEffect(() => {
    const updateNearbyDrivers = async () => {
      if (userLatitude && userLongitude) {
        const currentLocation = { lat: userLatitude, lng: userLongitude };
        const last = lastLocationRef.current;

        // Only proceed if location has changed significantly
        if (
          last &&
          Math.abs(currentLocation.lat - last.lat) < 0.0001 &&
          Math.abs(currentLocation.lng - last.lng) < 0.0001
        ) {
          return;
        }

        lastLocationRef.current = currentLocation;


        // Fetch only once
        if (!drivers || drivers.length === 0) {
          try {
            const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/driver/get-all`;

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const result = await response.json();
            const allDrivers = result.data;
            setDrivers(allDrivers);
            // setNearbyDrivers(allDrivers)
            // setMarkers(allDrivers)
          } catch (error) {
            console.error('Error fetching drivers:', error);
            return;
          }
        }

        // updateMarkersOnMap();

        // setTimeout(async () => {
        //   allDrivers.map(item => {
        //     if (ws && ws.readyState === WebSocket.OPEN) {
        //       console.log('request rider location')
        //       //send use to send req
        //       ws.send(JSON.stringify({
        //         type: 'getDriverLocation',
        //         role: 'customer',
        //         driverId: item.id
        //       }));
        //     }

        //   })
        //   console.log('drivers after adding location', drivers)
        //   allDrivers = drivers;

        //   // Now filter nearby drivers
        //   let markers: PlainDriver[] = [];
        //   if (destinationLatitude && destinationLongitude) {
        //     markers = await getNearbyDrivers(userLatitude, userLongitude, drivers, destinationLatitude, destinationLongitude);
        //   }
        //   else {
        //     markers = await getNearbyDrivers(userLatitude, userLongitude, drivers);
        //   }
        // }, 10000)
        // setNearbyDrivers(allDrivers);

        const updatedDrivers = useDriverStore.getState().nearbyDrivers?.filter(
          (driver) => driver.userLatitude && driver.userLongitude
        ) || [];

        updateMarkersOnMap(updatedDrivers);
      }
    };
    updateNearbyDrivers();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);



  // useEffect(()=>{
  //   updateMarkersOnMap();
  // },[nearbyDrivers])


  // console.log('nearby drivers')
  // console.log(nearbyDrivers)
  // console.log('drivers')
  // console.log(drivers)




  // //to-delete
  // useEffect(() => {
  //   const renderMarkersFirstTime = async () => {
  //     if (userLatitude && userLongitude && drivers) {
  //       const markers = await getNearbyDrivers(userLatitude, userLongitude, drivers);
  //       setNearbyDrivers(markers);
  //     }
  //   }
  //   renderMarkersFirstTime()
  // }, [drivers])

  const recenterMap = () => {
    const startLongitude = userLongitude ?? driverOriginLongitude;
    const startLatitude = userLatitude ?? driverOriginLatitude;

    if (mapRef.current &&
      startLatitude && startLongitude) {
      mapRef.current.animateToRegion({
        latitude: startLatitude!,
        longitude: startLongitude!,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startLat = userLatitude ?? driverOriginLatitude;
      const startLng = userLongitude ?? driverOriginLongitude;
      const endLat = destinationLatitude ?? driverDestinationLatitude;
      const endLng = destinationLongitude ?? driverDestinationLongitude;

      const isValidCoordinate = (value?: number) =>
        typeof value === 'number' && !isNaN(value);

      const startValid = isValidCoordinate(startLat!) && isValidCoordinate(startLng!);
      const endValid = isValidCoordinate(endLat) && isValidCoordinate(endLng);
      console.log("🧭 Using coordinates for map fitting:", {
        driverOriginLatitude,
        driverOriginLongitude,
        driverDestinationLatitude,
        driverDestinationLongitude,
        rideStatus
      });

      if (mapRef.current && startValid && endValid) {
        console.log('✅ Fitting to coordinates:');
        console.log({ startLat, startLng, endLat, endLng });
        mapRef.current.fitToCoordinates(
          [
            { latitude: startLat!, longitude: startLng! },
            { latitude: endLat!, longitude: endLng! },
          ],
          {
            edgePadding: {
              top: 100,
              right: 50,
              bottom: 400,
              left: 50,
            },
            animated: true,
          }
        );
      } else if (mapRef.current && startValid) {
        console.log('✅ Only start coordinate available, centering there');
        mapRef.current.animateToRegion(
          {
            latitude: startLat!,
            longitude: startLng!,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      } else {
        console.warn('⚠️ No valid coordinates available to show on map');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    driverDestinationLongitude,
    driverDestinationLatitude,
    driverOriginLongitude,
    driverOriginLatitude,
    path,
  ]);





  if (loading || (!longitude && !latitude)) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className='text-white mt-4'>Waiting for the location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }


  const handleMapInteraction = () => {
    Keyboard.dismiss();
  };

  return (
    <View className='flex-1'>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16
        }}
        customMapStyle={mapCustomStyle}
        tintColor='black'
        mapType='standard'
        region={region}
        showsMyLocationButton={false}
        showsUserLocation={true}
        userInterfaceStyle='dark'
      >
        {
          path !== '/home' && (
            <>
              {destinationLatitude && destinationLongitude && (
                <Marker
                  key={`${destinationLatitude}-${destinationLongitude}-${rideStatus}-${Math.random()}`}
                  coordinate={{
                    latitude: destinationLatitude,
                    longitude: destinationLongitude
                  }}
                  title='Destination of customer'
                />
              )}

              {driverDestinationLatitude && driverDestinationLongitude && path !== '/final-page' && (
                <Marker
                  key={`${driverDestinationLatitude}-${driverDestinationLongitude}-${rideStatus}`}
                  coordinate={{
                    latitude: driverDestinationLatitude,
                    longitude: driverDestinationLongitude
                  }}
                  title='Destination'
                />
              )}

              {selectedDriverDetails?.userLatitude && selectedDriverDetails?.userLongitude && (
                <Marker
                  key={`${selectedDriverDetails.id}-${rideStatus}`}
                  coordinate={{
                    latitude: selectedDriverDetails.userLatitude!,
                    longitude: selectedDriverDetails.userLongitude!
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  title={selectedDriverDetails.full_name!}
                  image={
                    selectedDriverId === selectedDriverDetails.id ? icons.selectedMarker : icons.marker
                  }
                />
              )}


              {userLatitude && userLongitude && destinationLatitude && destinationLongitude && (
                <MapViewDirections
                  key={`${selectedDriverDetails?.userLatitude}-${selectedDriverDetails?.userLongitude}-${rideStatus}-${userLatitude}-${userLongitude}-${destinationLatitude}-${destinationLongitude}`}
                  origin={{
                    latitude: userLatitude,
                    longitude: userLongitude
                  }}
                  destination={{
                    latitude: destinationLatitude,
                    longitude: destinationLongitude
                  }}
                  apikey={googlePlacesApiKey!}
                  strokeColor='#ffffff'
                  precision='high'
                  strokeWidth={5}
                />
              )}


              {destinationLatitude && destinationLongitude && selectedDriverDetails && rideStatus === 'Start' && (
                <MapViewDirections
                  key={`${selectedDriverDetails.id}-${rideStatus}-${destinationLatitude}-${destinationLongitude}`}
                  origin={{
                    latitude: selectedDriverDetails?.userLatitude!,
                    longitude: selectedDriverDetails?.userLongitude!
                  }}
                  destination={{
                    latitude: destinationLatitude,
                    longitude: destinationLongitude,
                  }}
                  apikey={googlePlacesApiKey!}
                  strokeColor='#ffffff'
                  precision='high'
                  strokeWidth={5}
                />
              )}



              {userLatitude && userLongitude && destinationLatitude && destinationLongitude && selectedDriverDetails && customerDestinationLatitude && customerDestinationLongitude && rideStatus && (
                <MapViewDirections
                  key={`${selectedDriverDetails.id}-${customerDestinationLatitude}-${customerDestinationLongitude}-${rideStatus}-${destinationLatitude}-${destinationLongitude}`}
                  origin={{
                    latitude: selectedDriverDetails?.userLatitude!,
                    longitude: selectedDriverDetails?.userLongitude!
                  }}
                  destination={{
                    // latitude: destinationLatitude,
                    latitude: customerDestinationLatitude,
                    longitude: customerDestinationLongitude,
                    // longitude: destinationLongitude
                  }}
                  apikey={googlePlacesApiKey!}
                  strokeColor='#ffffff'
                  precision='high'
                  strokeWidth={5}
                />
              )}

              {driverOriginLatitude && driverOriginLongitude && driverDestinationLatitude && driverDestinationLongitude && (
                <MapViewDirections
                  key={`${driverOriginLatitude}-${driverDestinationLatitude}-${rideStatus}`}
                  origin={{
                    latitude: driverOriginLatitude,
                    longitude: driverOriginLongitude
                  }}
                  destination={{
                    latitude: driverDestinationLatitude,
                    longitude: driverDestinationLongitude,
                  }}
                  apikey={googlePlacesApiKey!}
                  strokeColor='#ffffff'
                  precision='high'
                  strokeWidth={5}
                />
              )}
            </>
          )
        }
        {markers && markers.length > 0 && !selectedDriverDetails && (
          markers?.filter(marker => marker.userLatitude && marker.userLongitude)
            .map(marker => (
              <Marker
                key={`${marker.id}-${rideStatus}`}
                coordinate={{
                  latitude: marker.userLatitude!,
                  longitude: marker.userLongitude!
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                title={marker.full_name!}
                image={
                  selectedDriverId === marker.id ? icons.selectedMarker : icons.marker
                }
              />
            )) || []
        )}
      </MapView>

      <TouchableOpacity
        onPress={recenterMap}
        className={`${path === '/home' ? 'bottom-3' : 'top-14'} absolute right-6 p-3 rounded-full shadow-md z-50 bg-black`}
      >
        <FontAwesome6 name="location-crosshairs" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Map;
