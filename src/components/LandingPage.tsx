import { Smartphone, UserRound, Shield } from "lucide-react";
import styles from "./LandingPage.module.css";

interface LandingPageProps {
	onGetStarted: () => void;
	error?: string;
	isSigningIn?: boolean;
}

export function LandingPage({
	onGetStarted,
	error,
	isSigningIn = false,
}: LandingPageProps) {
	return (
		<div className={styles.container}>
			<div className={styles.innerContainer}>
				<div className={styles.hero}>
					<img className={styles.logoImage} src="/Logo.png" alt="Circle logo" />

					{/* Main Headline */}
					<div className={styles.headline}>
						<img className={styles.nameImage} src="/Name.png" alt="Circle" />
						<p className={styles.subtitle}>
							A private social app where you can only connect with
							people you've met in real life.
						</p>
					</div>

					{/* Taglines */}
					<div className={styles.taglines}>
						<p className={styles.tagline}>
							"If you haven't met, you can't add."
						</p>
						<p className={styles.tagline}>"Real life first."</p>
						<p className={styles.tagline}>
							"Small circles. Real people."
						</p>
					</div>

					{/* CTA Button */}
					<button onClick={onGetStarted} className={styles.ctaButton}>
						{isSigningIn ? "Opening Google..." : "Continue with Google"}
					</button>
					{error && <p className={styles.error}>{error}</p>}
				</div>

				{/* Features */}
				<div className={styles.features}>
					<div className={styles.featureCard}>
						<div
							className={`${styles.featureIcon} ${styles.emerald}`}
						>
							<Smartphone />
						</div>
						<h3 className={styles.featureTitle}>Connect in person</h3>
						<p className={styles.featureDescription}>
							Use a nearby NFC tag to add someone. No searching,
							no usernames, no spam.
						</p>
					</div>

					<div className={styles.featureCard}>
						<div
							className={`${styles.featureIcon} ${styles.green}`}
						>
							<UserRound />
						</div>
						<h3 className={styles.featureTitle}>
							Only People You've Met
						</h3>
						<p className={styles.featureDescription}>
							Every connection has weight. No strangers, no bots,
							no influencers you don't know.
						</p>
					</div>

					<div className={styles.featureCard}>
						<div className={`${styles.featureIcon} ${styles.teal}`}>
							<Shield />
						</div>
						<h3 className={styles.featureTitle}>Privacy First</h3>
						<p className={styles.featureDescription}>
							No GPS history saved. Connections verified by
							proximity, not by surveillance.
						</p>
					</div>
				</div>

				{/* How It Works */}
				<div className={styles.howItWorks}>
					<h2 className={styles.sectionTitle}>How It Works</h2>
					<div className={styles.stepsList}>
						<div className={styles.stepCard}>
							<div className={styles.stepContent}>
								<div
									className={`${styles.stepNumber} ${styles.one}`}
								>
									1
								</div>
								<div>
									<h4 className={styles.stepTitle}>
										Both people open Circle
									</h4>
									<p className={styles.stepDescription}>
										Make sure you're both on the add screen
									</p>
								</div>
							</div>
							<p className={styles.attribution}>Created by Type_Software</p>
						</div>

						<div className={styles.stepCard}>
							<div className={styles.stepContent}>
								<div
									className={`${styles.stepNumber} ${styles.two}`}
								>
									2
								</div>
								<div>
									<h4 className={styles.stepTitle}>
										Scan a nearby NFC tag
									</h4>
									<p className={styles.stepDescription}>
										Use the QR fallback if NFC isn't available
									</p>
								</div>
							</div>
						</div>

						<div className={styles.stepCard}>
							<div className={styles.stepContent}>
								<div
									className={`${styles.stepNumber} ${styles.three}`}
								>
									3
								</div>
								<div>
									<h4 className={styles.stepTitle}>
										Both confirm
									</h4>
									<p className={styles.stepDescription}>
										Connection created. That's it!
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
