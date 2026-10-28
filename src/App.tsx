import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
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
		let isActive = true;
		const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
			void (async () => {
				if (!isActive) {
					return;
				}

				setUser(nextUser);
				setProfile(null);
				setError("");

				if (!nextUser) {
					setIsSigningIn(false);
					setIsLoading(false);
					return;
				}

				try {
					const nextProfile = await getOrCreateProfile(nextUser);
					if (isActive) {
						setProfile(nextProfile);
					}
				} catch (profileError) {
					if (isActive) {
						const message =
							profileError instanceof Error
								? profileError.message
								: "Unable to load your profile.";
						setError(
							`Google sign-in succeeded for ${nextUser.email ?? "your account"}, but Circle could not load your profile. ${message}`,
						);
					}
				} finally {
					if (isActive) {
						setIsSigningIn(false);
						setIsLoading(false);
					}
				}
			})();
		});

		return () => {
			isActive = false;
			unsubscribe();
		};
	}, []);

	const handleSignIn = async () => {
		setError("");
		setIsSigningIn(true);
		try {
			await signInWithGoogle();
		} catch (signInError) {
			if (
				signInError instanceof FirebaseError &&
				signInError.code === "auth/unauthorized-domain"
			) {
				setError(
					`This app's address (${window.location.origin}) is not authorized for Google sign-in. Add it to Firebase Authentication > Settings > Authorized domains, then try again.`,
				);
			} else {
				setError(
					signInError instanceof Error
						? signInError.message
						: "Google sign-in was not completed.",
				);
			}
		} finally {
			setIsSigningIn(false);
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
