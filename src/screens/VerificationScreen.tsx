import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { VERIFF_DONE_URL_FRAGMENT } from "../config";

interface Props {
  verificationUrl: string;
  onFinished: () => void;
  onCancel: () => void;
}

export default function VerificationScreen({
  verificationUrl,
  onFinished,
  onCancel,
}: Props) {
  const [camera, requestCamera] = useCameraPermissions();
  const [mic, requestMic] = useMicrophonePermissions();
  const [asked, setAsked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ask for camera AND microphone up front, one after the other,
  // so the WebView's combined request is already granted when Veriff asks.
  useEffect(() => {
    if (!camera || !mic || asked) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAsked(true);
    (async () => {
      if (!camera.granted && camera.canAskAgain) await requestCamera();
      if (!mic.granted && mic.canAskAgain) await requestMic();
    })();
  }, [camera, mic, asked]);

  if (!camera || !mic) return <ActivityIndicator style={styles.center} />;

  if (!camera.granted || !mic.granted) {
    const blocked =
      (!camera.granted && !camera.canAskAgain) ||
      (!mic.granted && !mic.canAskAgain);
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12, textAlign: "center" }}>
          Camera and microphone access are required to verify your ID.
        </Text>
        {blocked ? (
          <Button
            title="Open settings"
            onPress={() => Linking.openSettings()}
          />
        ) : (
          <Button
            title="Grant access"
            onPress={async () => {
              if (!camera.granted) await requestCamera();
              if (!mic.granted) await requestMic();
            }}
          />
        )}
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
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["https://*"]}
        webviewDebuggingEnabled // lets you inspect via chrome://inspect; remove for production
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={(req) => {
          if (req.url.includes(VERIFF_DONE_URL_FRAGMENT)) {
            onFinished();
            return false;
          }
          return true;
        }}
      />
      {loading && (
        <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
