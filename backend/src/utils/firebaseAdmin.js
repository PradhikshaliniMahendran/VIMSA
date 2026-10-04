import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  }

  if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin initialized successfully.");
  } else if (!serviceAccount) {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin failed to initialize.");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error);
}

export default admin;
