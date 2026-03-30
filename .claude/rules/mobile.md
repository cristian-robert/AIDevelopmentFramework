---
description: Mobile development rules — auto-loads when editing mobile/native files
globs: ["**/mobile/**", "**/native/**", "**/*.native.*", "**/expo/**"]
---

# Mobile Rules

## Expo Skills (use the right one for the task)

| Task | Skill |
|------|-------|
| Building screens, components, navigation | `/expo-app-design:building-native-ui` |
| API calls, caching, offline support | `/expo-app-design:native-data-fetching` |
| Tailwind/NativeWind setup | `/expo-app-design:expo-tailwind-setup` |
| Dev client builds, TestFlight | `/expo-app-design:expo-dev-client` |
| API routes with EAS Hosting | `/expo-app-design:expo-api-routes` |
| Web code in native webview | `/expo-app-design:use-dom` |
| SwiftUI components | `/expo-app-design:expo-ui-swift-ui` |
| Jetpack Compose components | `/expo-app-design:expo-ui-jetpack-compose` |

## Skill Chain

1. **architect-agent RETRIEVE** — understand screen/navigation structure
2. **Expo skill** — appropriate skill from table above
3. **context7 MCP** — verify Expo/React Native API
4. **mobile-tester-agent VERIFY/FLOW** — verify on simulator after implementation

## Conventions

- Follow Expo Router file-based routing
- Use platform-specific extensions (`.ios.tsx`, `.android.tsx`) only when necessary
- Animations via `react-native-reanimated`
- Navigation state managed by Expo Router, not manually
