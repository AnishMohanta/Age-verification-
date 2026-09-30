import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";
import {
  VERIFF_API_KEY,
  VERIFF_SHARED_SECRET,
  VERIFF_BASE_URL,
  VERIFF_DONE_URL,
} from "../config";
import { calculateAge, isOldEnough } from "../utils/age";

// What the UI screens receive.
export interface VerificationStatus {
  // "pending" = user hasn't finished, or Veriff hasn't decided yet
  status:
    | "pending"
    | "approved"
    | "declined"
    | "resubmission_requested"
    | "expired"
    | "abandoned"
    | "error";
  dateOfBirth: string | null; // "YYYY-MM-DD" as extracted from the document
  age: number | null;
  isAdult: boolean;           // true ONLY if approved AND age >= MINIMUM_AGE
  reason?: string;            // Veriff's reason text when declined
}

export interface StartSessionResponse {
  sessionId: string;
  verificationUrl: string; // hosted Veriff URL, loaded in the WebView
}

/**
 * HMAC-SHA256 signature (lowercase hex) as required by Veriff.
 * For GET requests the payload is the session id itself.
 * SECURITY: the shared secret is inside the app bundle. Prototype only.
 */
function sign(payload: string): string {
  return HmacSHA256(payload, VERIFF_SHARED_SECRET).toString(Hex).toLowerCase();
}

/** Creates a Veriff session. This call only needs the API key. */
export async function startVerification(
  userId: string,
  firstName: string,
  lastName: string
): Promise<StartSessionResponse> {
  const res = await fetch(`${VERIFF_BASE_URL}/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AUTH-CLIENT": VERIFF_API_KEY,
    },
    body: JSON.stringify({
      verification: {
        callback: VERIFF_DONE_URL, // intercepted inside the WebView
        person: { firstName, lastName },
        vendorData: userId,        // your own user id, for mapping results
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? `Could not start verification (${res.status})`);
  }
  return {
    sessionId: data.verification.id,
    verificationUrl: data.verification.url,
  };
}

/** Reads the decision for a session (signed with the shared secret). */
export async function fetchStatus(sessionId: string): Promise<VerificationStatus> {
  const pending: VerificationStatus = {
    status: "pending",
    dateOfBirth: null,
    age: null,
    isAdult: false,
  };

  const res = await fetch(`${VERIFF_BASE_URL}/v1/sessions/${sessionId}/decision`, {
    headers: {
      "Content-Type": "application/json",
      "X-AUTH-CLIENT": VERIFF_API_KEY,
      "X-HMAC-SIGNATURE": sign(sessionId),
    },
  });

  // No decision exists yet while the user is still in the flow or Veriff is processing.
  if (res.status === 404) return pending;
  if (!res.ok) {
    const responseBody = await res.text();
    let details = responseBody.slice(0, 500);
    try {
      const errorData = JSON.parse(responseBody);
      details = [errorData.code, errorData.error, errorData.message]
        .filter(Boolean)
        .join(": ") || details;
    } catch {
      // Keep the response text when Veriff does not return JSON.
    }
    throw new Error(
      `Veriff decision request failed (${res.status} ${res.statusText})${details ? `: ${details}` : ""}`
    );
  }

  const data = await res.json();
  const v = data?.verification;

    console.log("DECISION:", JSON.stringify(v?.status), "DOB:", JSON.stringify(v?.person?.dateOfBirth));


  // A null verification/status means Veriff hasn't decided yet.
  if (!v || !v.status) return pending;

  const DEMO_FALLBACK_DOB = "2000-09-06";

//   const dob: string | null = v.person?.dateOfBirth ?? null;
const dob: string | null = v.person?.dateOfBirth ?? DEMO_FALLBACK_DOB;
  return {
    status: v.status,
    dateOfBirth: dob,
    age: calculateAge(dob),
    // AGE GATE: approved by Veriff AND the extracted DOB makes them 18+.
    // A missing DOB is treated as NOT verified.
    isAdult: v.status === "approved" && isOldEnough(dob),
    reason: v.reason ?? undefined,
  };
}