import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { LandingPage } from "./components/LandingPage";
import { MainApp } from "./components/MainApp";
import "./App.css";
import {
	auth,
	firebaseConfigured,
	getOrCreateProfile,
	signInWithGoogle,
	type Profile,
} from "./lib/firebase";

export default function App() {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(Boolean(auth));
	const [isSigningIn, setIsSigningIn] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!auth) {
			return;
		}
		return onAuthStateChanged(auth, async (nextUser) => {
			setUser(nextUser);
			if (nextUser) {
				try {
					setProfile(await getOrCreateProfile(nextUser));
				} catch (profileError) {
					setError(
						profileError instanceof Error
							? profileError.message
							: "Unable to load your profile.",
					);
				}
			} else {
				setProfile(null);
			}
			setIsLoading(false);
		});
	}, []);

	const handleSignIn = async () => {
		setError("");
		setIsSigningIn(true);
		try {
			await signInWithGoogle();
		} catch (signInError) {
			setIsSigningIn(false);
			setError(
				signInError instanceof Error
					? signInError.message
					: "Google sign-in was not completed.",
			);
		}
	};

	if (isLoading) {
		return <div className="appLoading">Loading Circle...</div>;
	}

	if (!user || !profile) {
		return (
			<LandingPage
				onGetStarted={handleSignIn}
				isSigningIn={isSigningIn}
				error={
					error ||
					(!firebaseConfigured
						? "Add your Firebase settings to .env.local to enable Google sign-in."
						: "")
				}
			/>
		);
	}

	return (
		<MainApp
			user={user}
			profile={profile}
			onProfileChange={setProfile}
		/>
	);
}
