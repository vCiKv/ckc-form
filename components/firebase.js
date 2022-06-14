// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
//   apiKey: "AIzaSyAftE_8sAz8EaqTaHSK-hX5FPqevdjH2uU",
//   authDomain: "ckc-form.firebaseapp.com",
//   projectId: "ckc-form",
//   storageBucket: "ckc-form.appspot.com",
//   messagingSenderId: "892799215215",
//   appId: "1:892799215215:web:a61a2995b58ce229d00f9a"
  apiKey: process.env.NEXT_PUBLIC_API_KEY,  
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket:process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const dbStore = getFirestore(app);