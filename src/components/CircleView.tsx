import { useCallback, useEffect, useState } from "react";
import { MessageCircle, MoreVertical, UserRound } from "lucide-react";
import { getConfirmedCircleMembers, type CircleMember } from "../lib/firebase";
import styles from "./CircleView.module.css";

interface CircleViewProps {
	userId: string;
}

export function CircleView({ userId }: CircleViewProps) {
	const [members, setMembers] = useState<CircleMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const loadMembers = useCallback(async () => {
		setIsLoading(true);
		setError("");
		try {
			setMembers(await getConfirmedCircleMembers(userId));
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Unable to load your Circle.",
			);
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		// Loading remote Circle members updates state after the request resolves.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadMembers();
	}, [loadMembers]);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Your Circle</h1>
				<p className={styles.subtitle}>
					{members.length} confirmed real-life connection
					{members.length === 1 ? "" : "s"}
				</p>
			</div>

			<div className={styles.stats}>
				<div className={styles.statCard}>
					<div className={`${styles.statNumber} ${styles.emerald}`}>
						{members.length}
					</div>
					<div className={styles.statLabel}>Connections</div>
				</div>
				<div className={styles.statCard}>
					<div className={`${styles.statNumber} ${styles.green}`}>0</div>
					<div className={styles.statLabel}>This Month</div>
				</div>
				<div className={styles.statCard}>
					<div className={`${styles.statNumber} ${styles.teal}`}>0</div>
					<div className={styles.statLabel}>This Week</div>
				</div>
			</div>

			{isLoading && <p className={styles.subtitle}>Loading your Circle...</p>}
			{error && <p className={styles.error}>{error}</p>}

			{!isLoading && members.length > 0 && (
				<div className={styles.connectionsList}>
					{members.map((member) => (
						<div key={member.id} className={styles.connectionCard}>
							<div className={styles.connectionContent}>
								{member.photoURL ? (
									<img
										className={styles.avatar}
										src={member.photoURL}
										alt=""
									/>
								) : (
									<div className={styles.avatar}>
										<UserRound color="white" />
									</div>
								)}
								<div className={styles.info}>
									<h3 className={styles.name}>{member.displayName}</h3>
									<p className={styles.metAt}>
										{member.bio || "A confirmed Circle connection"}
									</p>
									<p className={styles.metDate}>Connected in real life</p>
								</div>
								<div className={styles.actions}>
									<button
										className={`${styles.actionButton} ${styles.message}`}
										aria-label={`Message ${member.displayName}`}
									>
										<MessageCircle />
									</button>
									<button
										className={styles.actionButton}
										aria-label={`More options for ${member.displayName}`}
									>
										<MoreVertical />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{!isLoading && !error && members.length === 0 && (
				<div className={styles.emptyState}>
					<div className={styles.emptyStateIcon}>
						<span>👋</span>
					</div>
					<h3 className={styles.emptyStateTitle}>Your Circle is Empty</h3>
					<p className={styles.emptyStateText}>
						People will appear here after you connect in person and the
						connection is confirmed.
					</p>
				</div>
			)}
		</div>
	);
}
