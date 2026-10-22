import { useState } from "react";
import type { User } from "firebase/auth";
import { House, UserRoundPlus, CircleUser, UserRound } from "lucide-react";
import { FeedView } from "./FeedView";
import { AddPeopleView } from "./AddPeopleView";
import { CircleView } from "./CircleView";
import { ProfileView } from "./ProfileView";
import styles from "./MainApp.module.css";
import type { Profile } from "../lib/firebase";

type View = "feed" | "add" | "circle" | "profile";

interface MainAppProps {
	user: User;
	profile: Profile;
	onProfileChange: (profile: Profile) => void;
}

export function MainApp({ user, profile, onProfileChange }: MainAppProps) {
	const [currentView, setCurrentView] = useState<View>("feed");

	return (
		<div className={styles.container}>
			{/* Main Content */}
			<div className={styles.mainContent}>
				{currentView === "feed" && <FeedView user={user} profile={profile} />}
				{currentView === "add" && <AddPeopleView userId={user.uid} />}
				{currentView === "circle" && <CircleView />}
				{currentView === "profile" && (
					<ProfileView
						user={user}
						profile={profile}
						onProfileChange={onProfileChange}
					/>
				)}
			</div>
			<div className={styles.attribution}>Created by Type_Software</div>

			{/* Bottom Navigation */}
			<nav className={styles.bottomNav}>
				<div className={styles.navContainer}>
					<button
						onClick={() => setCurrentView("feed")}
						className={`${styles.navButton} ${
							currentView === "feed"
								? `${styles.active} ${styles.feed}`
								: ""
						}`}
					>
						<House />
						<span>Promenade</span>
					</button>

					<button
						onClick={() => setCurrentView("add")}
						className={`${styles.navButton} ${
							currentView === "add"
								? `${styles.active} ${styles.add}`
								: ""
						}`}
					>
						<UserRoundPlus />
						<span>Add</span>
					</button>

					<button
						onClick={() => setCurrentView("circle")}
						className={`${styles.navButton} ${
							currentView === "circle"
								? `${styles.active} ${styles.circle}`
								: ""
						}`}
					>
						<CircleUser />
						<span>Circle</span>
					</button>

					<button
						onClick={() => setCurrentView("profile")}
						className={`${styles.navButton} ${
							currentView === "profile"
								? `${styles.active} ${styles.profile}`
								: ""
						}`}
					>
						<UserRound />
						<span>Profile</span>
					</button>
				</div>
			</nav>
		</div>
	);
}
