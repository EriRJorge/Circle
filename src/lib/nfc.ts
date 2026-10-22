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
	await reader.scan();
	reader.addEventListener("reading", (event) => {
		const record = event.message.records.find(
			(candidate) => candidate.recordType === "mime",
		);
		if (!record) {
			return;
		}
		const decoded = new TextDecoder().decode(record.data);
		const payload = JSON.parse(decoded) as ContactPayload;
		if (payload.version !== 1 || !payload.userId) {
			throw new Error("The NFC contact payload is invalid.");
		}
		void onContact(payload);
	});
}
