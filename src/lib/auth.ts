import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile, UserRole } from "./types";

const googleProvider = new GoogleAuthProvider();

// ===== Sign Up =====
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName });

  // Create user profile document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    avatarUrl: "",
    role,
    bio: "",
    socialLinks: [],
    createdAt: serverTimestamp(),
    totalSales: 0,
    totalEarnings: 0,
    avgRating: 0,
  });

  return user;
}

// ===== Sign In with Email =====
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ===== Sign In with Google =====
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;

  // Check if profile exists, create if not
  const profileRef = doc(db, "users", user.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    await setDoc(profileRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "BeatVault User",
      avatarUrl: user.photoURL || "",
      role: "buyer" as UserRole,
      bio: "",
      socialLinks: [],
      createdAt: serverTimestamp(),
      totalSales: 0,
      totalEarnings: 0,
      avgRating: 0,
    });
  }

  return user;
}

// ===== Sign Out =====
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// ===== Get User Profile =====
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const profileSnap = await getDoc(doc(db, "users", uid));
  if (!profileSnap.exists()) return null;
  return { ...profileSnap.data(), uid } as UserProfile;
}

// ===== Update User Profile =====
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const { uid: _uid, createdAt: _created, ...updateData } = data as Record<string, unknown>;
  void _uid;
  void _created;
  await updateDoc(doc(db, "users", uid), updateData);
}

// ===== Auth State Listener =====
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
