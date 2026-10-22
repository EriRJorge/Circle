# Circle

Circle is a private social app for people you meet in real life. Google
accounts identify members, Firestore stores profiles and pending connections,
and Web NFC can exchange a Circle contact through a nearby NFC tag.

## Local setup

1. Create or select the Firebase project `nfc-social`.
2. Enable **Google** under Firebase Authentication > Sign-in providers.
3. Create a Firestore database.
4. Deploy [firestore.rules](./firestore.rules).
5. Copy [`.env.example`](./.env.example) to `.env.local` and fill it with the
   Firebase web app configuration.
6. Add `localhost`, `127.0.0.1`, and the production hostname to Firebase
   Authentication > Settings > Authorized domains.
7. Run:

   ```powershell
   npm install
   npm run dev
   ```

The local app is available at `http://localhost:5174` when port 5173 is already
occupied.

## Production deployment

The repository includes [firebase.json](./firebase.json) and
[.firebaserc](./.firebaserc) for Firebase Hosting and Firestore rules.

Install and authenticate the Firebase CLI, then run:

```powershell
npm run build
firebase login
firebase deploy --only hosting,firestore
```

The production host must use HTTPS. Add its exact hostname to Firebase
Authentication > Settings > Authorized domains before testing Google sign-in.

## NFC behavior

Web NFC is supported only in secure contexts (HTTPS or localhost) and on
supported Android browsers. The browser API reads and writes NFC tags; it does
not provide arbitrary phone-to-phone NFC communication. Circle therefore
exchanges a Firebase user ID through a nearby tag and creates a pending
connection. Both users must confirm before the connection should expose
Circle content.

Desktop browsers and iOS Safari use the QR fallback instead of Web NFC.

## Validation

```powershell
npm run lint
npm run build
```
