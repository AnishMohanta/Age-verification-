// App-wide settings. Everything here ships inside the APK (prototype only).

export const VERIFF_API_KEY = process.env.EXPO_PUBLIC_VERIFF_API_KEY ?? "";
export const VERIFF_SHARED_SECRET =
  process.env.EXPO_PUBLIC_VERIFF_SHARED_SECRET ?? "";
export const VERIFF_BASE_URL =
  process.env.EXPO_PUBLIC_VERIFF_BASE_URL ?? "https://api-saas.veriff.com";

// Minimum age to use the app. Change it here and it applies everywhere.
export const MINIMUM_AGE = 18;

// Sent to Veriff as the "callback" URL. When the WebView tries to open it,
// we know the user has finished the flow and intercept the navigation.
export const VERIFF_DONE_URL = "https://example.com/veriff-done";
// export const VERIFF_DONE_URL = "https://www.veriff.com/get-verified?navigation=slim";
export const VERIFF_DONE_URL_FRAGMENT = "veriff-done";

// TEMPORARY: a session you already created. Remove when testing the full sign-up flow.
// export const TEST_SESSION_URL =
//   "https://saas.veriff.com/v/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3OTA3ODUxNDUsInNlc3Npb25faWQiOiJiNjFhMWNkZS01MjcxLTQ2MGUtOTUwNS05NGE4YzgxMTMzZGMiLCJpaWQiOiIwMGY1MjBhYy04ZjIxLTQ2ZDEtYjFmMi1kMWJhNTc2MWJiNTMiLCJ2aWQiOiI0YTQ1MDY4MC01YzYxLTRlNjAtYmNhMS00NTNhNjhjZTE0MzQiLCJjaWQiOiJzYWFzLTMiLCJleHAiOjE3OTEzODk5NDV9.waeIuCEyKPR0JVQ-L4hSiLRMPe91AmM4uMOhv8hNUik";
export const TEST_SESSION_URL =
  "https://saas.veriff.com/v/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3OTA4NDExMzcsInNlc3Npb25faWQiOiI5NTYzMDQ0YS01YTY2LTRlMmYtODkwYi05NTBlNzY1ZjliN2UiLCJpaWQiOiJkYjgyN2JiYy1lYzEyLTQ3NGQtYjRkOC0zMWViZmJmMGQ5NjYiLCJ2aWQiOiI0YTQ1MDY4MC01YzYxLTRlNjAtYmNhMS00NTNhNjhjZTE0MzQiLCJjaWQiOiJzYWFzLTQiLCJleHAiOjE3OTE0NDU5Mzd9.Gk4YkjkggAytV0sWGxXmOsgWPln2B14YwSHDtEpl4Zo";

// Session id taken from the link's token payload.
export const TEST_SESSION_ID = "b61a1cde-5271-460e-9505-94a8c81133dc";
