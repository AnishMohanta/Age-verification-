# TESTING.md

## 1. Setup
- App: Expo React Native, local development build, no backend
- Tested on a real device (not an emulator)
- Provider: Veriff, tested in two environments: the **test integration** and a
  **live integration** (free trial)
- Configured in the app: API key, shared secret and session settings for each
  integration

## 2. Test integration
The test integration is created automatically for every Veriff account and is
not billed.

| What I tested | Result |
|---------------|--------|
| Start a session from the app | Works |
| SDK opens, captures document and selfie | Works |
| Automatic approve/decline decision | Not provided; I had to set the status manually in the Veriff Customer Portal |
| Date of birth in the result | Returned as `null` |

**Why:** Veriff does not process sessions in the test integration, so there is
no real check and no data is extracted from the document. This is expected, and
it means age verification cannot be proven in test mode.

## 3. Live integration (trial)
Because test mode cannot return an age, I created a live integration on the
free trial and repeated the flow with real documents.

| Test | Document | Result |
|------|----------|--------|
| 1 | My own passport | Verification completed, correct age detected |
| 2 | My father's PAN card | Verification completed, correct age detected |

Veriff's decision and extracted details were returned automatically, with no
manual approval.

## 4. Test vs live
| | Test integration | Live integration (trial) |
|---|------------------|--------------------------|
| Billed | No | Counts against trial (up to 50 sessions) |
| Processed by Veriff | No | Yes |
| Decision | Set manually in portal | Automatic |
| Date of birth | `null` | Extracted correctly |
| Good for | Checking the app flow | Proving real age verification |

## 5. Observations and limitations
- Test mode is only useful to check that the app, SDK and session creation work.
- Only two real documents were tested, both with correct ages. I did not test
  an under-age user, a declined or expired document, or a user cancelling.
- With no backend, the app holds the API key and shared secret. This is fine
  for a prototype but not for production, where the shared secret and decision
  handling must live on a server (webhook or decision endpoint).
- Real personal ID data was used only for these tests during the trial.

## 6. Next steps
- Add a backend to create sessions and receive decision webhooks
- Compare the extracted date of birth against the client's minimum age (to be
  confirmed with the client) and block under-age users
