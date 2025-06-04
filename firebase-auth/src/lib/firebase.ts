import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVvfcTgmufUTp91MV17sr3CXmGNVDzpsE",
  authDomain: "authtest3-b1ac4.firebaseapp.com",
  projectId: "authtest3-b1ac4",
  storageBucket: "authtest3-b1ac4.firebasestorage.app",
  messagingSenderId: "985006403151",
  appId: "1:985006403151:web:6fa743c782da1e53d2043a",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function registerUserWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    return res;
  } catch (error) {
    alert(error.message);
  }
}

export async function loginUerWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res;
  } catch (error) {
    alert(error.message);
  }
}

export async function logout() {
  try {
    await auth.signOut();
  } catch (error) {
    alert(error.message);
  }
}

export async function loginWithGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    alert(error.message);
  }
}
