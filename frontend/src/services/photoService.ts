import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const API_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  // Upload directly to Firebase Storage from frontend
  const storageRef = ref(storage, `profile-photos/${userId}_${Date.now()}.jpg`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadURL = await getDownloadURL(storageRef);

  // Save the URL to the user profile via backend
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/auth/save-photo-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ photoURL: downloadURL }),
  });

  // Cache locally so app doesn't need to fetch from server on next load
  localStorage.setItem('photoURL', downloadURL);

  return downloadURL;
}
