import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "../../serviceAccount.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
    });
  } else {
    admin.initializeApp({
      databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
    });
  }
}

export const db = admin.database();
export default admin;