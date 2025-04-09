import { DriverStore, LocationStore, MarkerData } from '@/types/type'
import { create } from 'zustand'

export const useLocationStore = create<LocationStore>((set) => ({
    userAddress: null,
    userLongitude: null,
    userLatitude: null,
    destinationAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    setUserLocation: ({ latitude, longitude, address, }: { latitude: number, longitude: number, address: string }) => {
        set((state) => ({
            // state.userLatitude to know the value userLatitude
            userLatitude: latitude,
            userLongitude: longitude,
            userAddress: address
        }))
    },
    setDestinationLocation: ({ latitude, longitude, address, }: { latitude: number, longitude: number, address: string }) => {
        set(() => ({
            userLatitude: latitude,
            userLongitude: longitude,
            userAddress: address
        }))
    },
}));

export const useDriverStore = create<DriverStore>((set) => ({
    drivers: [] as MarkerData[],
    selectedDriver: null,
    setSelectedDriver: (driverId: number) => {
        set(() => ({
            selectedDriver: driverId
        }))
    },
    setDrivers: (drivers: MarkerData[]) => {
        set(() => ({
            drivers: drivers
        }))
    },
    clearSelectedDriver: () => {
        set(() => ({
            selectedDriver: null
        }))
    }
}))