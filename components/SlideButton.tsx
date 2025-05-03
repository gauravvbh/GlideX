import React, { useRef } from 'react';
import { View, Text, Animated, PanResponder, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideButtonProps {
    title: string;
    onComplete: () => void;
    bgColor?: string;
    textColor?: string;
}

const SlideButton: React.FC<SlideButtonProps> = ({
    title,
    onComplete,
    bgColor = '#0F9D58',
    textColor = '#fff',
}) => {
    const sliderWidth = SCREEN_WIDTH * 0.85;
    const handleWidth = 60;

    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dx > 0 && gesture.dx <= sliderWidth - handleWidth) {
                    pan.setValue({ x: gesture.dx, y: 0 });
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx >= sliderWidth - handleWidth - 10) {
                    Animated.timing(pan, {
                        toValue: { x: sliderWidth - handleWidth, y: 0 },
                        duration: 150,
                        useNativeDriver: false,
                    }).start(() => {
                        onComplete();
                        setTimeout(() => pan.setValue({ x: 0, y: 0 }), 300);
                    });
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                        bounciness: 10,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <View
            className="h-16 rounded-full justify-center items-center px-2 relative overflow-hidden"
            style={{ width: sliderWidth, backgroundColor: bgColor }}
        >
            <Text
                className="absolute font-semibold text-base z-10"
                style={{ color: textColor }}
            >
                {title}
            </Text>

            <Animated.View
                {...panResponder.panHandlers}
                className="absolute top-0 left-0 rounded-full z-20"
                style={{
                    width: handleWidth,
                    height: handleWidth,
                    backgroundColor: textColor,
                    transform: [{ translateX: pan.x }],
                }}
            />
        </View>
    );
};

export default SlideButton;
