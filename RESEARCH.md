# RESEARCH.md

## 1. Goal
Verify a new user's age from an ID document at sign-up, using a third-party
service, in an Expo React Native app (prototype, Android, no backend).

## 2. Providers compared
| | Veriff | Yoti | Persona |
|---|--------|------|---------|
| React Native SDK | Yes (official) | Not found (web, iOS, Android only) | Yes (official) |
| Expo support | Yes, via config plugin and dev build | n/a | Dev build needed |
| Free testing | 15-day trial, up to 50 sessions | Sandbox, but needs verified Yoti Hub account | Sandbox mode in SDK |
| Age from ID document | Yes | Yes, plus selfie age estimation | Yes |
| UK strength | Global ID coverage | Best: UK company, ACCS-certified | Global, US-focused |
| Works without backend | Yes (public API key creates session) | No RN SDK, slower setup | Needs dashboard template setup |
| Cost | About $0.80 per verification | Custom pricing | Reported $250/month minimum |

## 3. Recommendation: Veriff
- Official React Native SDK with Expo support, so it fits my project.
- A session can be created with only the public API key, so no backend is needed for the prototype.
- Free trial is enough to test and record the flow.
- Handles document capture and selfie matching in one built-in screen.
- Pay per verification, and retries are not billed.

Yoti is stronger on UK certification but has no React Native SDK and a slower
setup.

## 4. Limitations and next steps
- Without a backend, the app only knows the user finished or cancelled. The real
  approve/decline result comes via webhook, so I check it in the Veriff portal.
- The API key is stored in the app, which is fine for a prototype only.
- Not Expo Go: a development build is required.
- Next: add a small backend for sessions and webhooks, store only the result, and
  confirm UK GDPR and data retention with the client.
