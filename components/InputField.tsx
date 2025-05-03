import { View, Text, KeyboardAvoidingView, TouchableWithoutFeedback, Image, TextInput, Keyboard } from 'react-native'
import { useState } from 'react'
import { InputFieldProps } from '@/types/type'

const InputField = ({
    label,
    labelStyle,
    icon,
    secureTextEntry = false,
    containerStyle,
    inputStyle,
    iconStyle,
    className,
    ...props
}: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <KeyboardAvoidingView behavior="height">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className='my-2 w-full'>
                    <Text className={`text-base text-white font-JakartaSemiBold mb-3 ${labelStyle}`}>
                        {label}
                    </Text>
                    <View className={`flex flex-row items-center bg-neutral-950 rounded-full border ${isFocused ? 'border-primary-500' : 'border-slate-950'} ${containerStyle}`}>
                        {icon && <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />}
                        <TextInput
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`text-white rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle}`}
                            secureTextEntry={secureTextEntry}
                            placeholderTextColor="#888"
                            {...props}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default InputField
