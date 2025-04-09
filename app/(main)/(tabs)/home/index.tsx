import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import * as Linking from 'expo-linking'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomePage = () => {

    const { user } = useUser();
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        try {
            await signOut()
            // Redirect to your desired page
            Linking.openURL(Linking.createURL('/'))
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <SafeAreaView className='bg-[#0F0F10] flex-1 justify-start items-start px-4'>
            <View className='bg-yellow-300'>
                <SignedIn>
                    <Text className='text-white '>Hello {user?.emailAddresses[0].emailAddress}</Text>
                    <Text className='text-white'>Hello {user?.emailAddresses[0].emailAddress}</Text>
                    <TouchableOpacity onPress={handleSignOut}>
                        <Text>Sign out</Text>
                    </TouchableOpacity>
                </SignedIn>
            </View>
            <SignedOut>
                <Link href="/(auth)/sign-in">
                    <Text className='text-white'>Sign in</Text>
                </Link>
                <Link href="/(auth)/sign-up">
                    <Text className='text-white'>Sign up</Text>
                </Link>
            </SignedOut>
        </SafeAreaView>
    )
}

export default HomePage