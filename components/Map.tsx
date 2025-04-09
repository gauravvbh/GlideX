import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'
import { useDriverStore, useLocationStore } from '@/store'
import { calculateRegion, generateMarkersFromData } from '@/lib/calcRegion'
import { drivers, icons } from '@/constants/data'
import { MarkerData } from '@/types/type'

const Map = () => {

  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const {
    selectedDriver,
    setDrivers
  } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([])


  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude
      })
      setMarkers(newMarkers);
    }
  }, [drivers])


  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16
      }}
      tintColor='black'
      mapType='standard'
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle='dark'
    >
      {
        markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude
            }}
            title={marker.title}
            image={
              selectedDriver === marker.id ? icons.selectedMarker : icons.marker
            }
          >

          </Marker>
        ))
      }
    </MapView>
  )
}

export default Map