import axios from 'axios';

// Use your machine's IP address here (same network as the phone using Expo Go)
const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

const api = axios.create({
    baseURL, // All requests will be prefixed with this
    headers: {
        'Content-Type': 'application/json',
        // Add other default headers if needed
    },
});

export default api;
