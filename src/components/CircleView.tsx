import { MessageCircle, MoreVertical } from "lucide-react";
import styles from "./CircleView.module.css";

// Mock data
const mockConnections = [
	{
		id: 1,
		name: "Sarah Chen",
		avatar: "👩🏻",
		metAt: "Coffee shop, Downtown",
		metDate: "Met 2 weeks ago",
		mutualConnections: 3,
	},
	{
		id: 2,
		name: "Marcus Williams",
		avatar: "👨🏾",
		metAt: "Book club",
		metDate: "Met 1 month ago",
		mutualConnections: 5,
	},
	{
		id: 3,
		name: "Emma Rodriguez",
		avatar: "👩🏽",
		metAt: "Yoga class",
		metDate: "Met 3 weeks ago",
		mutualConnections: 2,
	},
	{
		id: 4,
		name: "Alex Kim",
		avatar: "👨🏻",
		metAt: "5K Run event",
		metDate: "Met 1 week ago",
		mutualConnections: 4,
	},
	{
		id: 5,
		name: "Lisa Park",
		avatar: "👩🏻",
		metAt: "Neighborhood BBQ",
		metDate: "Met 5 days ago",
		mutualConnections: 6,
	},
	{
		id: 6,
		name: "Jordan Thompson",
		avatar: "👨🏽",
		metAt: "Art gallery opening",
		metDate: "Met yesterday",
		mutualConnections: 1,
	},
];

export function CircleView() {
	return (
		<div className={styles.container}>
			{/* Header */}
			<div className={styles.header}>
				<h1 className={styles.title}>Your Circle</h1>
				<p className={styles.subtitle}>
					{mockConnections.length} real connections
				</p>
			</div>

			{/* Stats */}
			<div className={styles.stats}>
				<div className={styles.statCard}>
					<div className={`${styles.statNumber} ${styles.emerald}`}>
						{mockConnections.length}
					</div>
					<div className={styles.statLabel}>Connections</div>
				</div>
				<div className={styles.statCard}>
					<div className={`${styles.statNumber} ${styles.green}`}>
						12
					</div>
					<div className={styles.statLabel}>This Month</div>
				</div>
				<div className={styles.statCard}>
					<div className={`${styles.statNumber} ${styles.teal}`}>
						3
					</div>
					<div className={styles.statLabel}>This Week</div>
				</div>
			</div>

			{/* Connections List */}
			<div className={styles.connectionsList}>
				{mockConnections.map((connection) => (
					<div key={connection.id} className={styles.connectionCard}>
						<div className={styles.connectionContent}>
							{/* Avatar */}
							<div className={styles.avatar}>
								{connection.avatar}
							</div>

							{/* Info */}
							<div className={styles.info}>
								<h3 className={styles.name}>
									{connection.name}
								</h3>
								<p className={styles.metAt}>
									{connection.metAt}
								</p>
								<p className={styles.metDate}>
									{connection.metDate}
								</p>
							</div>

							{/* Actions */}
							<div className={styles.actions}>
								<button
									className={`${styles.actionButton} ${styles.message}`}
								>
									<MessageCircle />
								</button>
								<button className={styles.actionButton}>
									<MoreVertical />
								</button>
							</div>
						</div>

						{/* Mutual Connections */}
						{connection.mutualConnections > 0 && (
							<div className={styles.mutualConnections}>
								<p>
									{connection.mutualConnections} mutual
									connection
									{connection.mutualConnections !== 1
										? "s"
										: ""}
								</p>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Empty State */}
			{mockConnections.length === 0 && (
				<div className={styles.emptyState}>
					<div className={styles.emptyStateIcon}>
						<span>👋</span>
					</div>
					<h3 className={styles.emptyStateTitle}>
						Your Circle is Empty
					</h3>
					<p className={styles.emptyStateText}>
						Start adding people you meet in real life!
					</p>
					<button className={styles.emptyStateButton}>
						Add Someone Now
					</button>
				</div>
			)}
		</div>
	);
}
