import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Button, StyleSheet } from "react-native";
import { fetchStatus, VerificationStatus } from "../api/verification";
import { MINIMUM_AGE } from "../config";

interface Props {
  sessionId: string;
  onRestart: () => void;
}

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20; // about 1 minute, then we show "still checking"

export default function ResultScreen({ sessionId, onRestart }: Props) {
  const [result, setResult] = useState<VerificationStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const attempts = useRef(0);

  // Veriff decides asynchronously (usually within seconds), so we poll for the decision.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let lastLoggedError: string | null = null;

    const poll = async () => {
      try {
        const s = await fetchStatus(sessionId);
        if (cancelled) return;
        if (s.status !== "pending") {
          setResult(s);
          return; // final decision, stop polling
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message !== lastLoggedError) {
          console.error("[Veriff] Decision polling failed:", error);
          lastLoggedError = message;
        }
      }
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        if (!cancelled) setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  // No decision after ~1 minute.
  if (timedOut) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Still checking...</Text>
        <Text>We haven&apos;t received a decision yet. Please try again shortly.</Text>
        <View style={{ height: 16 }} />
        <Button title="Start again" onPress={onRestart} />
      </View>
    );
  }

  // Waiting for the first decision.
  if (!result) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Checking your document...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {result.isAdult ? (
        // Approved AND old enough.
        <>
          <Text style={styles.title}>✅ Age verified</Text>
          <Text>Verified age: {result.age}</Text>
          <Text>You can now use the app.</Text>
        </>
      ) : result.status === "approved" ? (
        // Document was valid, but the person is under the minimum age
        // (or Veriff returned no date of birth).
        <>
          <Text style={styles.title}>⛔ Age requirement not met</Text>
          <Text>You must be {MINIMUM_AGE} or over to use this app.</Text>
        </>
      ) : (
        // Declined, resubmission requested, expired, etc.
        <>
          <Text style={styles.title}>
            ❌ Verification {result.status.replace(/_/g, " ")}
          </Text>
          {result.reason ? <Text>{result.reason}</Text> : null}
        </>
      )}
      <View style={{ height: 16 }} />
      <Button title="Start over" onPress={onRestart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});