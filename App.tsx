// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });



import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import SignUpScreen from "./src/screens/SignUpScreen";
import VerificationScreen from "./src/screens/VerificationScreen";
import ResultScreen from "./src/screens/ResultScreen";

// Minimal state-based "navigation" so the prototype needs no extra libraries.
type Step =
  | { name: "signup" }
  | { name: "verify"; sessionId: string; url: string }
  | { name: "result"; sessionId: string };

export default function App() {
  const [step, setStep] = useState<Step>({ name: "signup" });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Step 1: sign-up form -> creates a Veriff session */}
      {step.name === "signup" && (
        <SignUpScreen
          onSessionReady={(sessionId, url) => setStep({ name: "verify", sessionId, url })}
        />
      )}

      {/* Step 2: hosted Veriff flow (ID document + selfie) in a WebView */}
      {step.name === "verify" && (
        <VerificationScreen
          verificationUrl={step.url}
          onFinished={() => setStep({ name: "result", sessionId: step.sessionId })}
          onCancel={() => setStep({ name: "signup" })}
        />
      )}

      {/* Step 3: poll the decision and show verified / under age / declined */}
      {step.name === "result" && (
        <ResultScreen
          sessionId={step.sessionId}
          onRestart={() => setStep({ name: "signup" })}
        />
      )}
    </SafeAreaView>
  );
}