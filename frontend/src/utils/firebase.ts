import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACBKK-9Cax30qAwVpzYH44_t0uWkCFsQg",
  authDomain: "vimsaclothing-e1a60.firebaseapp.com",
  projectId: "vimsaclothing-e1a60",
  storageBucket: "vimsaclothing-e1a60.firebasestorage.app",
  messagingSenderId: "955787064063",
  appId: "1:955787064063:web:604912a78110daf5f412ca",
  measurementId: "G-HMPQ67M2YW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
