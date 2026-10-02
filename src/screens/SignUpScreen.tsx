import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { startVerification } from "../api/verification";
import colors from "../constants/colors";

interface Props {
  // Called once Veriff has created a session for this user.
  onSessionReady: (sessionId: string, verificationUrl: string) => void;
}

export default function SignUpScreen({ onSessionReady }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Missing details", "Please enter your first and last name.");
      return;
    }
    try {
      setLoading(true);
      // Prototype: a fake user id. In the real app use your auth user id.
      // It is sent to Veriff as "vendorData" so results map back to the user.
      const userId = `user-${Date.now()}`;
      const { sessionId, verificationUrl } = await startVerification(
        userId,
        firstName.trim(),
        lastName.trim()
      );
      onSessionReady(sessionId, verificationUrl);
    } catch (e: any) {
      console.error("[Veriff] Session creation failed:", e);
      Alert.alert("Error", e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>AGE VERIFICATION</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            You will need to verify your age with a photo ID (passport, driving licence or ID card).
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>FIRST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Your first name"
            placeholderTextColor={colors.textMuted}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            accessibilityLabel="First name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>LAST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Your last name"
            placeholderTextColor={colors.textMuted}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            accessibilityLabel="Last name"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleContinue}
          disabled={loading}
          accessibilityRole="button"
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          {loading ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  heading: { marginBottom: 34 },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 14,
  },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: "800", marginBottom: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 17, lineHeight: 24 },
  field: { marginBottom: 20 },
  label: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    color: colors.textPrimary,
    fontSize: 17,
    height: 64,
    paddingHorizontal: 18,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderColor: colors.accentBorder,
    borderRadius: 16,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: colors.onAccent, fontSize: 19, fontWeight: "800" },
});