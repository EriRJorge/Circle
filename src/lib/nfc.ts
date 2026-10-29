export interface ContactPayload {
	version: 1;
	userId: string;
}

interface NdefRecord {
	recordType: string;
	data: ArrayBuffer;
}

interface NdefMessage {
	records: NdefRecord[];
}

interface NdefReader {
	scan(options?: { signal?: AbortSignal }): Promise<void>;
	write(message: { records: Array<{ recordType: string; data: string }> }): Promise<void>;
	addEventListener(
		type: "reading",
		listener: (event: { message: NdefMessage }) => void,
	): void;
	removeEventListener(
		type: "reading",
		listener: (event: { message: NdefMessage }) => void,
	): void;
}

declare global {
	interface Window {
		NDEFReader?: new () => NdefReader;
	}
}

export function nfcSupported() {
	return "NDEFReader" in window && window.isSecureContext;
}

export async function writeContactToNfc(userId: string) {
	if (!window.NDEFReader) {
		throw new Error("NFC is only available in Chrome on supported Android devices.");
	}
	const reader = new window.NDEFReader();
	const payload: ContactPayload = { version: 1, userId };
	await reader.write({
		records: [{ recordType: "mime", data: JSON.stringify(payload) }],
	});
}

export async function readContactFromNfc(
	onContact: (payload: ContactPayload) => Promise<void>,
) {
	if (!window.NDEFReader) {
		throw new Error("NFC is only available in Chrome on supported Android devices.");
	}
	const reader = new window.NDEFReader();
	const controller = new AbortController();

	return new Promise<void>((resolve, reject) => {
		let hasReadContact = false;
		const handleReading = (event: { message: NdefMessage }) => {
			if (hasReadContact) {
				return;
			}

			try {
				const record = event.message.records.find(
					(candidate) =>
						candidate.recordType === "mime" ||
						candidate.recordType === "text",
				);
				if (!record) {
					return;
				}
				const payload = JSON.parse(
					new TextDecoder().decode(record.data),
				) as Partial<ContactPayload>;
				if (
					payload.version !== 1 ||
					typeof payload.userId !== "string" ||
					!payload.userId
				) {
					throw new Error("The NFC contact payload is invalid.");
				}

				hasReadContact = true;
				controller.abort();
				reader.removeEventListener("reading", handleReading);
				void onContact(payload as ContactPayload)
					.then(resolve)
					.catch(reject);
			} catch (error) {
				controller.abort();
				reader.removeEventListener("reading", handleReading);
				reject(
					error instanceof Error
						? error
						: new Error("The NFC contact payload is invalid."),
				);
			}
		};

		reader.addEventListener("reading", handleReading);
		void reader.scan({ signal: controller.signal }).catch((error: unknown) => {
			reader.removeEventListener("reading", handleReading);
			reject(
				error instanceof Error
					? error
					: new Error("Unable to start NFC scanning."),
			);
		});
	});
}
