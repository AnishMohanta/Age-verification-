import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchStatus, VerificationStatus } from "../api/verification";
import { MINIMUM_AGE } from "../config";
import colors from "../constants/colors";

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
        <View style={styles.content}>
          <View style={[styles.badge, styles.neutralBadge]}>
            <Text style={[styles.badgeText, styles.neutralBadgeText]}>...</Text>
          </View>
          <Text style={styles.eyebrow}>VERIFICATION UPDATE</Text>
          <Text style={styles.title}>Still checking...</Text>
          <Text style={styles.description}>
            We haven&apos;t received a decision yet. Please try again shortly.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onRestart}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Start again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Waiting for the first decision.
  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.eyebrow, styles.pendingEyebrow]}>AGE VERIFICATION</Text>
          <Text style={styles.title}>Checking your document</Text>
          <Text style={styles.description}>This usually only takes a few moments.</Text>
        </View>
      </View>
    );
  }

  const approved = result.isAdult;
  const underMinimumAge = result.status === "approved" && !approved;
  const badgeStyle = approved
    ? styles.successBadge
    : underMinimumAge
      ? styles.warningBadge
      : styles.dangerBadge;
  const badgeTextStyle = approved
    ? styles.successBadgeText
    : underMinimumAge
      ? styles.warningBadgeText
      : styles.dangerBadgeText;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>
            {approved ? "✓" : underMinimumAge ? "!" : "×"}
          </Text>
        </View>
        <Text style={styles.eyebrow}>VERIFICATION RESULT</Text>
        {approved ? (
          <>
            <Text style={styles.title}>Age verified</Text>
            <Text style={styles.ageLabel}>Verified age</Text>
            <Text style={styles.ageValue}>{result.age}</Text>
            <Text style={styles.description}>You can now use this app.</Text>
          </>
        ) : underMinimumAge ? (
          <>
            <Text style={styles.title}>Age requirement not met</Text>
            <Text style={styles.description}>
              You must be {MINIMUM_AGE} or over to use this app.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              Verification {result.status.replace(/_/g, " ")}
            </Text>
            <Text style={styles.description}>
              {result.reason || "Please try again or contact support for help."}
            </Text>
          </>
        )}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onRestart}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Start over</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  content: { alignItems: "center", maxWidth: 420, width: "100%" },
  badge: {
    alignItems: "center",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    marginBottom: 24,
    width: 80,
  },
  successBadge: { backgroundColor: colors.successSurface },
  warningBadge: { backgroundColor: colors.warningSurface },
  dangerBadge: { backgroundColor: colors.dangerSurface },
  neutralBadge: { backgroundColor: colors.surface },
  badgeText: { fontSize: 42, fontWeight: "700" },
  successBadgeText: { color: colors.accent },
  warningBadgeText: { color: colors.warning },
  dangerBadgeText: { color: colors.danger },
  neutralBadgeText: { color: colors.textSecondary, fontSize: 28 },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  pendingEyebrow: { marginTop: 28 },
  title: {
    color: colors.textPrimary,
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    textAlign: "center",
  },
  ageLabel: { color: colors.textSecondary, fontSize: 15, marginTop: 8 },
  ageValue: {
    color: colors.accent,
    fontSize: 36,
    fontWeight: "800",
    marginVertical: 4,
  },
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.accent,
    borderColor: colors.accentBorder,
    borderRadius: 16,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    marginTop: 4,
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: colors.onAccent, fontSize: 18, fontWeight: "800" },
});