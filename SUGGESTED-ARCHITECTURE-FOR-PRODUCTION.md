# Age verification with Veriff: production architecture

Verify that a new user is 18 or older during sign-up. The mobile app only shows the screens. A backend holds the secrets, talks to Veriff and decides the result.

## Flow

1. After sign-up, the app asks the backend to start verification.
2. The backend creates a Veriff session with its API key.
3. Veriff returns a one-time session link, valid for 7 days.
4. The backend sends only the link to the app.
5. The app opens the link and the user scans their ID and selfie on Veriff's screen.
6. Veriff sends the decision to the backend as a signed webhook.
7. The backend checks the signature, applies the age rule and saves the result.
8. The app asks the backend for the status.
9. The backend answers verified, pending or declined, and the app unlocks or blocks the account.

## Why the backend must be there

- **Secrets can't be hidden in an app.** Anyone can unpack an APK, and `EXPO_PUBLIC_*` values are bundled into it. A leaked API key lets others create sessions on your bill, and a leaked shared secret lets them forge or read decisions.
- **The client can't be trusted to decide age.** A user can modify the app, root the device or intercept requests. The age decision has to be made on a server the user can't touch.
- **Webhooks need a server.** Veriff delivers decisions to a public HTTPS address. An app can't receive them, and the result must still arrive if the user closes the app.
- **The result must be stored somewhere durable.** The backend keeps the status per user, so it survives reinstalls and new devices.
- **Abuse control.** The backend ties each session to a logged-in user, rate-limits session creation and keeps an audit trail.
- **Privacy.** Date of birth and ID data stay off the device. The backend stores only the result (verified 18+, session id, date).
- **Key rotation.** Changing a key on the backend needs no new app release, while a key inside the app does.
