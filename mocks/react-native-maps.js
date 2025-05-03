// mocks/react-native-maps.js

import React from 'react';
import { View, Text } from 'react-native';

export const Marker = () => <View />;
export const PROVIDER_GOOGLE = 'google';

const MapView = ({ children }) => (
    <View>
        <Text>Map not available on web</Text>
        {children}
    </View>
);

export default MapView;
