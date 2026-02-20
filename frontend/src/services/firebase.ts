import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBywugNbnlvM4ei-Er_fOQBnIp4568eznI",
  authDomain: "orazaapp.firebaseapp.com",
  projectId: "orazaapp",
  storageBucket: "orazaapp.firebasestorage.app",
  messagingSenderId: "214190749878",
  appId: "1:214190749878:web:0da803277b0a8787e7ce17",
  databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);