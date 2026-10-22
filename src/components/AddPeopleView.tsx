import { useState } from "react";
import { Smartphone, QrCode, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import styles from "./AddPeople.module.css";
import {
	createNfcConnection,
} from "../lib/firebase";
import {
	nfcSupported,
	readContactFromNfc,
	writeContactToNfc,
} from "../lib/nfc";

type AddMode = "tap" | "qr";

interface AddPeopleViewProps {
	userId: string;
}

export function AddPeopleView({ userId }: AddPeopleViewProps) {
	const [mode, setMode] = useState<AddMode>("tap");
	const [isWorking, setIsWorking] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleNfcWrite = async () => {
		setIsWorking(true);
		setError("");
		setMessage("");
		try {
			await writeContactToNfc(userId);
			setMessage("Your Circle contact is ready to be read by the other phone.");
		} catch (nfcError) {
			setError(
				nfcError instanceof Error
					? nfcError.message
					: "Unable to write the NFC contact.",
			);
		} finally {
			setIsWorking(false);
		}
	};

	const handleNfcRead = async () => {
		setIsWorking(true);
		setError("");
		setMessage("Hold the other phone near this device.");
		try {
			await readContactFromNfc(async ({ userId: otherUserId }) => {
				await createNfcConnection(userId, otherUserId);
				setMessage("Contact found. The connection is waiting for confirmation.");
				setIsWorking(false);
			});
		} catch (nfcError) {
			setIsWorking(false);
			setError(
				nfcError instanceof Error
					? nfcError.message
					: "Unable to read the NFC contact.",
			);
		}
	};

	return (
		<div className={styles.container}>
			{/* Header */}
			<div className={styles.header}>
				<h1 className={styles.title}>Add Someone You're With</h1>
				<p className={styles.subtitle}>
					Connect with people you've met in real life
				</p>
			</div>

			{/* Mode Toggle */}
			<div className={styles.modeToggle}>
				<button
					onClick={() => setMode("tap")}
					className={`${styles.modeButton} ${
						mode === "tap" ? styles.active : ""
					}`}
				>
					<div className={styles.modeButtonContent}>
						<Smartphone />
						<span>NFC Tag</span>
					</div>
				</button>

				<button
					onClick={() => setMode("qr")}
					className={`${styles.modeButton} ${
						mode === "qr" ? styles.active : ""
					}`}
				>
					<div className={styles.modeButtonContent}>
						<QrCode />
						<span>QR Code</span>
					</div>
				</button>
			</div>

			{/* Main Content */}
			<div className={styles.mainCard}>
				{mode === "tap" && (
					<div className={styles.tapContent}>
						{/* Tap Animation */}
						<div className={styles.animationArea}>
							{!isWorking && (
								<motion.div
									animate={{ scale: [1, 1.1, 1] }}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
									className={styles.phoneIcon}
								>
									<Smartphone />
								</motion.div>
							)}

							{isWorking && (
								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									className={styles.phoneIcon}
								>
									<div className={styles.spinning}>
										<Smartphone />
									</div>
								</motion.div>
							)}

						</div>

						{/* Instructions */}
						<div className={styles.instructions}>
							<h2 className={styles.instructionTitle}>
								Real NFC Contact
							</h2>
							<p className={styles.instructionText}>
								Write your contact to an NFC tag or read the other person's Circle contact.
							</p>
						</div>

						{/* Tap Button */}
						<div className={styles.nfcActions}>
							<button onClick={() => void handleNfcWrite()} disabled={isWorking || !nfcSupported()} className={styles.tapButton}>
								{isWorking ? "Waiting..." : "Write My Contact"}
							</button>
							<button onClick={() => void handleNfcRead()} disabled={isWorking || !nfcSupported()} className={styles.scanButton}>
								Read Other Contact
							</button>
						</div>

						{/* Info */}
						<div className={styles.infoBox}>
							<p>
								<strong>How it works:</strong> Web NFC exchanges a
								contact payload with a nearby NFC tag.
								The connection is stored as pending until it is
								confirmed.
							</p>
						</div>
					</div>
				)}

				{mode === "qr" && (
					<div className={styles.qrContent}>
						{/* QR Code Display */}
						<div className={styles.qrDisplay}>
							{/* Timer */}
							<div className={styles.qrTimer}>
								<p>Unavailable until QR support is enabled</p>
							</div>
						</div>

						{/* Instructions */}
						<div className={styles.instructions}>
							<h2 className={styles.instructionTitle}>
								QR fallback is not enabled
							</h2>
							<p className={styles.instructionText}>
								Circle currently requires a supported NFC tag for
								contact exchange. Use the NFC tab on HTTPS or
								localhost with Chrome on Android.
							</p>
						</div>

						{/* Info */}
						<div className={styles.infoBox}>
							<p>
								<strong>Important:</strong> Do not share Firebase
								user IDs through screenshots or public links.
							</p>
						</div>
					</div>
				)}
			</div>

			{message && (
				<div className={styles.successMessage}>
					<CheckCircle />
					{message}
				</div>
			)}
			{error && <div className={styles.errorMessage}>{error}</div>}
		</div>
	);
}
