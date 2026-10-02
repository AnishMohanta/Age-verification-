# RESEARCH.md

## 1. Goal and key requirement
Verify a new user's age from an ID document at sign-up, using a third-party
service, in an Expo React Native app (prototype, Android, no backend).

**Key requirement:** it must work with UK ID documents, because the client is
UK-based. This is why Yoti was looked at first.

## 2. Providers compared
| | Veriff | Yoti | Persona |
|---|--------|------|---------|
| Integration route used | Hosted flow opened in an in-app WebView (documented by Veriff for Android) | Not tested in this prototype | Not tested in this prototype |
| Free testing | 15-day trial, up to 50 sessions | Sandbox, but needs a verified Yoti Hub account | Sandbox mode |
| Age from ID document | Yes | Yes, plus selfie age estimation | Yes |
| UK strength | Global ID coverage | Best: UK company, ACCS-certified | Global, US-focused |
| Setup for a prototype | A session can be created with only the API key | Slower: account verification first | Needs dashboard template setup first |
| Cost | About $0.80 per verification | Custom pricing | Reported $250/month minimum |

## 3. Recommendation: Veriff
- The verification flow is hosted by Veriff and can be loaded in an in-app
  WebView, so no extra native module is needed in the Expo app.
- A session can be created with only the API key, so no backend is needed for
  the prototype.
- The free trial is enough to test and record the full flow.
- Document capture and selfie matching happen in one built-in flow.
- Pay per verification, and retries are not billed.
- Global ID coverage, which should include UK passports and driving licences
  (to be confirmed with Veriff before going live).

Yoti is stronger on UK certification, which is why it was the first option
considered, but its setup is slower for a prototype.

## 4. How it is integrated
- The app creates a Veriff session and opens the session link in a WebView.
- The camera and microphone permissions are declared in the app and requested at
  runtime before the flow opens, as Veriff's Android WebView guide requires.
- Test mode is used throughout, so nothing is billed.

## 5. Limitations and next steps
- Without a backend, the app only knows the user finished or cancelled. The real
  approve/decline result comes via webhook, so I check it in the Veriff portal.
- The API key is stored in the app, which is fine for a prototype only.
- Test mode does not prove that real UK documents are accepted. Confirm this
  with Veriff before going live.
- Next: add a small backend for sessions and webhooks, store only the result, and
  confirm UK GDPR and data retention with the client. Revisit Yoti if the client
  needs UK ACCS certification.


