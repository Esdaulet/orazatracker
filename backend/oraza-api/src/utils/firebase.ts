import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

if (!admin.apps.length) {
  try {
    // For local development with serviceAccount.json
    const serviceAccountPath = path.join(__dirname, "../../serviceAccount.json");
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8"),
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
        storageBucket: "orazaapp.appspot.com",
      });
    } else {
      // For Firebase Functions production (uses default credentials)
      admin.initializeApp({
        databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
        storageBucket: "orazaapp.appspot.com",
      });
    }
  } catch (error) {
    // Fallback for Firebase Functions environment
    admin.initializeApp({
      databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
      storageBucket: "orazaapp.appspot.com",
    });
  }
}

export const db = admin.database();
export const storage = admin.storage();
export default admin;
