import React from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { ActivityIndicator, View } from 'react-native'

const Page = () => {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        )
    }

    return isSignedIn ? (
        <Redirect href={'/(main)/(tabs)/home'} />
    ) : (
        <Redirect href={'/(auth)/welcome'} />
    )
}

export default Page
