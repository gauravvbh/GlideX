import { Tabs } from 'expo-router';
import { Image, ImageSourcePropType, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { icons } from '@/constants/data';

const TabIcon = ({ focused, source }: { focused: boolean; source: ImageSourcePropType }) => {
    return (
        <View
            className="flex-row justify-center items-center rounded-full"
            style={focused ? styles.tabIconContainerFocused : {}}
        >
            <View
                className={`rounded-full items-center justify-center ${focused ? 'bg-[#0286FF]' : 'bg-[#1F1F22]'}`}
                style={{ width: 48, height: 48 }}
            >
                <Image
                    source={source}
                    resizeMode="contain"
                    style={{ width: 24, height: 24, tintColor: 'white' }}
                />
            </View>
        </View>
    );
};

const TabBarButton = ({ children, onPress }: any) => {
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View className="flex-1 items-center justify-center">
                {children}
            </View>
        </TouchableWithoutFeedback>
    );
};

export default function TabsLayout() {
    return (
        <Tabs
            initialRouteName="home/index"
            screenOptions={{
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'white',
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#262628',
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 20,
                    height: 78,
                    position: 'absolute',
                }
            }}
        >
            {[
                { name: 'home/index', icon: icons.home },
                { name: 'rides/index', icon: icons.list },
                { name: 'chat/index', icon: icons.chat },
                { name: 'profile/index', icon: icons.profile }
            ].map(({ name, icon }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icon} />,
                        tabBarButton: (props) => <TabBarButton {...props} />,
                    }}
                />
            ))}
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabIconContainerFocused: {
        boxShadow: '0px 5px 10px rgba(2, 134, 255, 0.3)',
        elevation: 5,
    },
});
