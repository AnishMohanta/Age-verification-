import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { startVerification } from "../api/verification";

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
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        You will need to verify your age with a photo ID (passport, driving licence or ID card).
      </Text>

      <TextInput
        style={styles.input}
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
      />

      <Button
        title={loading ? "Please wait..." : "Continue to age verification"}
        onPress={handleContinue}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#555", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});