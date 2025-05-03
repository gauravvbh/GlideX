import { Customer, Driver, DriverDetails, DriverStore, RideOffer, RideOfferDetails, RidesStore, StoreRole, UserData, WSStore } from '@/types/type'
import { create } from 'zustand'

type PlainDriver = Omit<Driver, 'setCarImageURL' | 'setCarSeats' | 'setTime' | 'setPrice' | 'setUser' | 'setUserLocation' | 'setId' | 'setProfileImageURL' | 'setRating' | 'setFullName' | 'setRole'>;

// export const useDriverStore = create<DriverStore>((set) => ({
//     drivers: [], //from database all drivers
//     nearbyDrivers: [],
//     selectedDriverId: null,
//     setSelectedDriverId: (driverId: string) => {
//         set(() => ({
//             selectedDriverId: driverId
//         }))
//     },
//     setNearbyDrivers: (drivers: PlainDriver[]) => {
//         set(() => ({
//             nearbyDrivers: drivers
//         }))
//     },
//     setDrivers: (drivers: PlainDriver[]) => {
//         set(() => ({
//             drivers
//         }))
//     },
//     updateDriverLocation: (driverId: string, latitude: number, longitude: number, address: string) => {
//         set(state => ({
//             nearbyDrivers: state.drivers.map(driver =>
//                 driver.id === driverId ? (
//                     {
//                         ...driver,
//                         userLatitude: latitude,
//                         userLongitude: longitude,
//                         userAddress: address
//                     }
//                 )
//                     : driver
//             )
//         }))
//     },
//     removeDriverLocation: (driverId: string) => {
//         set(state => ({
//             nearbyDrivers: state.drivers.map(driver =>
//                 driver.id === driverId
//                     ? {
//                         ...driver,
//                         userLatitude: null,
//                         userLongitude: null,
//                         userAddress: null
//                     }
//                     : driver
//             )
//         }))
//     },
//     removeNearbyDriver: (driverId: string) => {
//         set(state => ({
//             nearbyDrivers: state.nearbyDrivers.filter(driver => driver.id !== driverId)
//         }));
//     },
//     clearSelectedDriver: () => {
//         set(() => ({
//             selectedDriverId: null
//         }))
//     }
// }))


// export const useDriverStore = create<DriverStore>((set, get) => ({
//     drivers: [], // from database all drivers
//     nearbyDrivers: [],
//     selectedDriverId: null,
//     selectedDriverDetails: null,

//     setSelectedDriverId: (driverId: string) => {
//         set(() => ({
//             selectedDriverId: driverId
//         }));
//     },
//     giveRiderDetails: (riderId: string) => {
//         const riderDetails = get().drivers.find(rider => rider.id === riderId);
//         return riderDetails;
//     },
//     setSelectedDriverDetails: (driver: PlainDriver) => {
//         set(() => ({
//             selectedDriverDetails: driver
//         }));
//     },

//     setNearbyDrivers: (drivers: PlainDriver | PlainDriver[]) => {
//         set(state => {
//             const newDrivers = Array.isArray(drivers) ? drivers : [drivers]; // Ensure drivers is always an array

//             // Add or update the drivers in the state
//             const updatedNearbyDrivers = newDrivers.reduce((acc, driver) => {
//                 const existingIndex = acc.findIndex(d => d.id === driver.id);
//                 if (existingIndex !== -1) {
//                     // If driver already exists, update it
//                     acc[existingIndex] = driver;
//                 } else {
//                     // If driver doesn't exist, add it
//                     acc.push(driver);
//                 }
//                 return acc;
//             }, [...state.nearbyDrivers]); // Start with existing nearby drivers

//             return { nearbyDrivers: updatedNearbyDrivers };
//         });
//     },


//     setDrivers: (drivers: PlainDriver[]) => {
//         set(() => ({
//             drivers
//         }));
//     },

//     updateDriverLocation: (driverId: string, latitude: number, longitude: number, address: string) => {
//         set(state => ({
//             nearbyDrivers: state.drivers.map(driver =>
//                 driver.id === driverId
//                     ? {
//                         ...driver,
//                         userLatitude: latitude,
//                         userLongitude: longitude,
//                         userAddress: address
//                     }
//                     : driver
//             )
//         }));
//     },
//     updateSelectedDriverLocation: (latitude: number, longitude: number, address: string) => {
//         set(state => ({
//             selectedDriverDetails: state.selectedDriverDetails ? {
//                 ...state.selectedDriverDetails,
//                 userLatitude: latitude,
//                 userLongitude: longitude,
//                 userAddress: address
//             } : null
//         }));
//     },


//     removeDriverLocation: (driverId: string) => {
//         set(state => ({
//             nearbyDrivers: state.drivers.map(driver =>
//                 driver.id === driverId
//                     ? {
//                         ...driver,
//                         userLatitude: null,
//                         userLongitude: null,
//                         userAddress: null
//                     }
//                     : driver
//             )
//         }));
//     },

//     removeNearbyDriver: (driverId: string) => {
//         set(state => ({
//             nearbyDrivers: state.nearbyDrivers.filter(driver => driver.id !== driverId)
//         }));
//     },
//     clearSelectedDriver: () => {
//         set(() => ({
//             selectedDriverId: null,
//             selectedDriverDetails: null
//         }));
//     }
// }));

export const useDriverStore = create<DriverStore>((set,get) => ({
    drivers: [], // from database all drivers
    nearbyDrivers: [],
    selectedDriverId: null,
    selectedDriverDetails: null,

    setSelectedDriverId: (driverId: string) => {
        set(() => ({
            selectedDriverId: driverId
        }));
    },

    setSelectedDriverDetails: (driver: PlainDriver) => {
        set(() => ({
            selectedDriverDetails: driver
        }));
    },

    setNearbyDrivers: (drivers: PlainDriver[]) => {
        set(() => ({
            nearbyDrivers: drivers
        }));
    },

    addNearbyDrivers: (driver: PlainDriver) => {
        set((state) => ({
            nearbyDrivers: [
                ...state.nearbyDrivers,
                driver
            ]
        }))
    },
    giveRiderDetails: (driverId: string) => {
        const riderDetails = get().drivers.find(rider => rider.id === driverId);
        return riderDetails;
    },

    setDrivers: (drivers: PlainDriver[]) => {
        set(() => ({
            drivers
        }));
    },

    updateDriverLocation: (driverId: string, latitude: number, longitude: number, address: string) => {
        set(state => ({
            nearbyDrivers: state.drivers.map(driver =>
                driver.id === driverId
                    ? {
                        ...driver,
                        userLatitude: latitude,
                        userLongitude: longitude,
                        userAddress: address
                    }
                    : driver
            )
        }));
    },
    updateSelectedDriverLocation: (latitude: number, longitude: number, address: string) => {
        set(state => ({
            selectedDriverDetails: state.selectedDriverDetails ? {
                ...state.selectedDriverDetails,
                userLatitude: latitude,
                userLongitude: longitude,
                userAddress: address
            } : null
        }));
    },


    removeDriverLocation: (driverId: string) => {
        set(state => ({
            nearbyDrivers: state.drivers.map(driver =>
                driver.id === driverId
                    ? {
                        ...driver,
                        userLatitude: null,
                        userLongitude: null,
                        userAddress: null
                    }
                    : driver
            )
        }));
    },

    removeNearbyDriver: (driverId: string) => {
        set(state => ({
            nearbyDrivers: state.nearbyDrivers.filter(driver => driver.id !== driverId)
        }));
    },
    clearSelectedDriver: () => {
        set(() => ({
            selectedDriverId: null,
            selectedDriverDetails: null
        }));
    }
}));


export const useRideOfferStore = create<RideOffer>((set, get) => ({
    rideOffer: [],
    activeRideId: null,
    addRideOffer: (ride: RideOfferDetails) => {
        set(state => ({
            rideOffer: [...state.rideOffer, ride],
        }));
    },
    removeRideOffer: (rideId: string) => {
        set(state => ({
            rideOffer: state.rideOffer.filter(offer => offer.id !== rideId)
        }))
    },
    giveRideDetails: (rideId: string) => {
        const ride = get().rideOffer.find(offer => offer.id === rideId);
        return ride;
    },
    setActiveRideId: (rideId: string) => {
        set(() => ({
            activeRideId: rideId
        }))
    },
    changeStatus: (rideId: string, newStatus: string) => {
        set(state => ({
            rideOffer: state.rideOffer.map(offer =>
                offer.id === rideId
                    ? {
                        ...offer,
                        status: newStatus
                    }
                    : offer
            )
        }))
    }
}))



export const useDriver = create<Driver>((set) => ({
    id: null,
    role: null,
    profile_image_url: null,
    rating: null,
    full_name: null,
    userLatitude: null,
    userLongitude: null,
    userAddress: null,
    car_image_url: null,
    car_seats: null,
    time: null,
    price: null,
    setCarImageURL: ({ car_image_url }: { car_image_url: string }) => {
        set(() => ({
            car_image_url
        }))
    },
    setCarSeats: ({ car_seats }: { car_seats: number }) => {
        set(() => ({
            car_seats
        }))
    },
    setUserLocation: ({ latitude, longitude, address }) => {
        set(() => ({
            userLatitude: latitude,
            userLongitude: longitude,
            userAddress: address,
        }));
    },
    setId: ({ customerId }) => {
        set(() => ({ id: customerId }));
    },
    setProfileImageURL: ({ profile_image_url }) => {
        set(() => ({ profile_image_url }));
    },
    setRating: ({ rating }) => {
        set(() => ({ rating }));
    },
    setFullName: ({ full_name }) => {
        set(() => ({ full_name }));
    },
    setRole: ({ role }) => {
        set(() => ({ role }));
    },
}))

export const useUserStore = create<StoreRole>((set) => ({
    role: null,
    setRole: ({ role }) => set(() => ({ role })),
}));


export const useCustomer = create<Customer>((set) => ({
    id: null,
    role: null,
    profile_image_url: null,
    rating: null,
    full_name: null,
    userLatitude: null,
    userLongitude: null,
    userAddress: null,
    destinationAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    setUserLocation: ({ latitude, longitude, address }) => {
        set(() => ({
            userLatitude: latitude,
            userLongitude: longitude,
            userAddress: address,
        }));
    },
    setId: ({ customerId }) => {
        set(() => ({ id: customerId }));
    },
    setProfileImageURL: ({ profile_image_url }) => {
        set(() => ({ profile_image_url }));
    },
    setRating: ({ rating }) => {
        set(() => ({ rating }));
    },
    setFullName: ({ full_name }) => {
        set(() => ({ full_name }));
    },
    setRole: ({ role }) => {
        set(() => ({ role }));
    },
    setDestinationLocation: ({ latitude, longitude, address }) => {
        console.log(latitude, longitude, address)
        set(() => ({
            destinationLatitude: latitude,
            destinationLongitude: longitude,
            destinationAddress: address,
        }));
    },
    clearDestinationLocation: () => {
        set(() => ({
            destinationAddress: null,
            destinationLatitude: null,
            destinationLongitude: null,
        }))
    }
}));

export const useRidesStore = create<RidesStore>((set) => ({
    Rides: [],
    selectedRide: null,
    setRides: (allRides) => set({ Rides: allRides }),
    setSelectedRide: (id) => {
        set((state) => {
            const selectRide = state.Rides.find(ride => ride.ride_id === id);
            return { selectedRide: selectRide }
        })
    }
}))

export const useDriverDetails = create<DriverDetails>((set) => ({
    onDuty: false,
    isVerified: null,
    setOnDuty: (onDuty: boolean) => {
        set(() => ({
            onDuty
        }))
    },
    setIsVerified: (verified: boolean) => {
        set(() => ({
            isVerified: verified
        }))
    },
}))


export const useWSStore = create<WSStore>((set) => ({
    ws: null,
    setWebSocket: (ws: WebSocket) => set({ ws }),
}))

