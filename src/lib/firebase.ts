import { getApp, getApps, initializeApp } from "firebase/app";
import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import {
	collection,
	doc,
	getDocs,
	getDoc,
	getFirestore,
	query,
	runTransaction,
	serverTimestamp,
	setDoc,
	where,
} from "firebase/firestore";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytes,
} from "firebase/storage";
import type { User } from "firebase/auth";

const requiredConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(requiredConfig).every(Boolean);

const app = firebaseConfigured
	? getApps().length > 0
		? getApp()
		: initializeApp(requiredConfig)
	: null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export interface Profile {
	displayName: string;
	bio: string;
	photoURL: string;
	state: string;
	createdAt?: unknown;
}

export type PostVisibility = "circle" | "public";

export interface Post {
	id: string;
	authorId: string;
	authorName: string;
	authorPhotoURL: string;
	content: string;
	mediaURL: string;
	mediaType: "image" | "";
	visibility: PostVisibility;
	state: string;
	createdAt?: unknown;
}

function requireFirebase() {
	if (!auth || !db || !storage) {
		throw new Error(
			"Firebase is not configured. Add the VITE_FIREBASE_* variables from .env.example.",
		);
	}
	return { auth, db, storage };
}

export async function signInWithGoogle(): Promise<void> {
	const { auth: firebaseAuth } = requireFirebase();
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({ prompt: "select_account" });
	await setPersistence(firebaseAuth, browserLocalPersistence);
	await signInWithPopup(firebaseAuth, provider);
}

export async function signOutUser() {
	const { auth: firebaseAuth } = requireFirebase();
	await signOut(firebaseAuth);
}

export async function getOrCreateProfile(user: User): Promise<Profile> {
	const { db: firestore } = requireFirebase();
	const profileRef = doc(firestore, "profiles", user.uid);
	const profileSnapshot = await getDoc(profileRef);
	if (profileSnapshot.exists()) {
		return {
			...profileSnapshot.data(),
			state: profileSnapshot.data().state ?? "",
		} as Profile;
	}

	const profile: Profile = {
		displayName: user.displayName ?? "Circle member",
		bio: "",
		photoURL: user.photoURL ?? "",
		state: "",
		createdAt: serverTimestamp(),
	};
	await setDoc(profileRef, profile);
	return profile;
}

export async function updateProfile(userId: string, profile: Profile) {
	const { db: firestore } = requireFirebase();
	await setDoc(doc(firestore, "profiles", userId), profile, { merge: true });
}

export async function uploadImage(
	path: string,
	file: File,
): Promise<string> {
	const { storage: firebaseStorage } = requireFirebase();
	const imageRef = ref(firebaseStorage, path);
	await uploadBytes(imageRef, file, { contentType: file.type });
	return getDownloadURL(imageRef);
}

export async function createPost(
	author: User,
	profile: Profile,
	content: string,
	visibility: PostVisibility,
	mediaURL = "",
): Promise<void> {
	const { db: firestore } = requireFirebase();
	const postRef = doc(collection(firestore, "posts"));
	await setDoc(postRef, {
		authorId: author.uid,
		authorName: profile.displayName,
		authorPhotoURL: profile.photoURL,
		content: content.trim(),
		mediaURL,
		mediaType: mediaURL ? "image" : "",
		visibility,
		state: profile.state.trim(),
		createdAt: serverTimestamp(),
	});
}

export async function getVisiblePosts(
	userId: string,
	state: string,
): Promise<Post[]> {
	const { db: firestore } = requireFirebase();
	const connectionsSnapshot = await getDocs(
		query(
			collection(firestore, "connections"),
			where("participants", "array-contains", userId),
		),
	);
	const circleIds = connectionsSnapshot.docs
		.filter((connection) => connection.data().status === "confirmed")
		.map((connection) => {
			const participants = connection.data().participants as string[];
			return participants.find((participant) => participant !== userId);
		})
		.filter((id): id is string => Boolean(id));

	const publicSnapshot = state.trim()
		? await getDocs(
				query(
					collection(firestore, "posts"),
					where("visibility", "==", "public"),
					where("state", "==", state.trim()),
				),
			)
		: { docs: [] };
	const circleSnapshot = await getDocs(
		query(
			collection(firestore, "posts"),
			where("visibility", "==", "circle"),
			where("authorId", "in", [userId, ...circleIds].slice(0, 30)),
		),
	);
	const posts = [...publicSnapshot.docs, ...circleSnapshot.docs]
		.map((post) => ({ id: post.id, ...post.data() }) as Post)
		.reduce((uniquePosts, post) => {
			uniquePosts.set(post.id, post);
			return uniquePosts;
		}, new Map<string, Post>());

	return [...posts.values()].sort((a, b) => {
		const aTime = (a.createdAt as { seconds?: number })?.seconds ?? 0;
		const bTime = (b.createdAt as { seconds?: number })?.seconds ?? 0;
		return bTime - aTime;
	});
}

export async function createNfcConnection(
	currentUserId: string,
	otherUserId: string,
) {
	const { db: firestore } = requireFirebase();
	if (currentUserId === otherUserId) {
		throw new Error("You cannot add yourself to your Circle.");
	}

	const participants = [currentUserId, otherUserId].sort();
	const connectionId = participants.join("_");
	await runTransaction(firestore, async (transaction) => {
		const connectionRef = doc(firestore, "connections", connectionId);
		const existing = await transaction.get(connectionRef);
		if (!existing.exists()) {
			transaction.set(connectionRef, {
				participants,
				status: "pending",
				createdAt: serverTimestamp(),
				createdBy: currentUserId,
			});
		}
	});
}
