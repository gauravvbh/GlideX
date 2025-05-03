// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your Firebase configuration (found in Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyA1Z36ZIaRTsIELiy8TJ3rMdAPha5-6ubw",
  projectId: "glidex-83723",
  storageBucket: "glidex-83723.firebasestorage.app",
  messagingSenderId: "254559139780",
  appId: "1:254559139780:android:544d5b79fcb3317a721691"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytesResumable, uploadBytes, getDownloadURL };
