import { useRef, useState } from "react";
import { LogOut, Settings, UserRound } from "lucide-react";
import type { User } from "firebase/auth";
import styles from "./ProfileView.module.css";
import {
	signOutUser,
	type Profile,
	updateProfile,
	uploadImage,
} from "../lib/firebase";

interface ProfileViewProps {
	user: User;
	profile: Profile;
	onProfileChange: (profile: Profile) => void;
}

export function ProfileView({
	user,
	profile,
	onProfileChange,
}: ProfileViewProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(profile);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handlePhotoUpload = async (file: File) => {
		setIsUploading(true);
		setError("");
		try {
			const photoURL = await uploadImage(`profiles/${user.uid}/avatar`, file);
			const nextProfile = { ...draft, photoURL };
			await updateProfile(user.uid, nextProfile);
			onProfileChange(nextProfile);
			setDraft(nextProfile);
		} catch (uploadError) {
			setError(
				uploadError instanceof Error
					? uploadError.message
					: "Unable to upload your profile picture.",
			);
		} finally {
			setIsUploading(false);
		}
	};

	const saveProfile = async () => {
		setIsSaving(true);
		setError("");
		try {
			await updateProfile(user.uid, draft);
			onProfileChange(draft);
			setIsEditing(false);
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Unable to save your profile.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.headerRow}>
				<h1 className={styles.title}>Profile</h1>
				<button className={styles.settingsButton} aria-label="Profile settings">
					<Settings />
				</button>
			</div>

			<div className={styles.profileCard}>
				<div className={styles.profileHeader}>
					{profile.photoURL ? (
						<img className={styles.avatarImage} src={profile.photoURL} alt="" />
					) : (
						<div className={styles.avatar} aria-hidden="true">
							<UserRound />
						</div>
					)}
					{isEditing && (
						<>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								hidden
								onChange={(event) => {
									const file = event.target.files?.[0];
									if (file) void handlePhotoUpload(file);
								}}
							/>
							<button
								className={styles.photoButton}
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading}
							>
								{isUploading ? "Uploading..." : "Change photo"}
							</button>
						</>
					)}
					<div className={styles.userInfo}>
						{isEditing ? (
							<input
								className={styles.profileInput}
								value={draft.displayName}
								onChange={(event) =>
									setDraft({ ...draft, displayName: event.target.value })
								}
								aria-label="Display name"
							/>
						) : (
							<h2 className={styles.userName}>{profile.displayName}</h2>
						)}
						<p className={styles.joinDate}>{user.email}</p>
						{isEditing ? (
							<textarea
								className={styles.profileInput}
								value={draft.bio}
								onChange={(event) =>
									setDraft({ ...draft, bio: event.target.value })
								}
								aria-label="Bio"
								rows={3}
							/>
						) : (
							<p className={styles.bio}>
								{profile.bio || "Tell your Circle a little about yourself."}
							</p>
						)}
						{isEditing && (
							<input
								className={styles.profileInput}
								value={draft.state}
								onChange={(event) =>
									setDraft({ ...draft, state: event.target.value })
								}
								placeholder="State (for public posts)"
								aria-label="State"
							/>
						)}
					</div>
				</div>

				<div className={styles.stats}>
					<div className={styles.stat}>
						<div className={styles.statValue}>0</div>
						<div className={styles.statLabel}>Posts</div>
					</div>
					<div className={styles.stat}>
						<div className={styles.statValue}>0</div>
						<div className={styles.statLabel}>Circle</div>
					</div>
					<div className={styles.stat}>
						<div className={styles.statValue}>0</div>
						<div className={styles.statLabel}>Likes</div>
					</div>
				</div>

				<div className={styles.actionButtons}>
					{isEditing ? (
						<>
							<button className={styles.editButton} onClick={saveProfile} disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Profile"}
							</button>
							<button className={styles.shareButton} onClick={() => setIsEditing(false)}>
								Cancel
							</button>
						</>
					) : (
						<button className={styles.editButton} onClick={() => setIsEditing(true)}>
							Edit Profile
						</button>
					)}
				</div>
				{error && <p className={styles.error}>{error}</p>}
			</div>

			<div className={styles.privacyInfo}>
				<h3 className={styles.privacyTitle}>
					<UserRound />
					Your Privacy
				</h3>
				<p>Circle posts are only visible to confirmed Circle members. Public posts are visible only to people in the same state.</p>
				<p>No one can find you by search or username. The only way to connect is in person.</p>
			</div>

			<button className={styles.logoutButton} onClick={() => void signOutUser()}>
				<LogOut />
				Sign Out
			</button>
		</div>
	);
}
