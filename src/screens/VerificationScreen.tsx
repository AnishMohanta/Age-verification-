import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Button } from "react-native";
import { WebView } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { VERIFF_DONE_URL_FRAGMENT } from "../config";

interface Props {
  verificationUrl: string;
  onFinished: () => void; // user completed the flow inside Veriff
  onCancel: () => void;
}

export default function VerificationScreen({ verificationUrl, onFinished, onCancel }: Props) {
  // Android needs the CAMERA runtime permission BEFORE the WebView can use the camera.
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(true);

  // Ask for permission automatically the first time the screen opens.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Permission state not loaded yet.
  if (!permission) return <ActivityIndicator style={styles.center} />;

  // Permission denied: explain and let the user retry or cancel.
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12, textAlign: "center" }}>
          Camera access is required to verify your ID.
        </Text>
        <Button title="Grant camera access" onPress={requestPermission} />
        <View style={{ height: 8 }} />
        <Button title="Cancel" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: verificationUrl }}
        javaScriptEnabled
        domStorageEnabled
        // Let the Veriff page use the camera without extra prompts.
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => setLoading(false)}
        // When Veriff redirects to our callback URL the flow is complete.
        // We block that navigation and move on to the result screen.
        onShouldStartLoadWithRequest={(req) => {
          if (req.url.includes(VERIFF_DONE_URL_FRAGMENT)) {
            onFinished();
            return false;
          }
          return true;
        }}
      />
      {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});