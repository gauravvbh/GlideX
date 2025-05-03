import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@clerk/clerk-expo'

const MainLayout = ({ isFontsLoaded }: { isFontsLoaded: boolean }) => {
    const { isLoaded } = useAuth();

    useEffect(() => {
        if (isFontsLoaded && isLoaded) {
            SplashScreen.hideAsync();
        }
    }, [isFontsLoaded, isLoaded]);

    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}

export default MainLayout