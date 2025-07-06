// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, uploadBytes, getDownloadURL } from 'firebase/storage';
import Constants from 'expo-constants';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} = Constants.expoConfig?.extra || {};


const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};



const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytesResumable, uploadBytes, getDownloadURL };
