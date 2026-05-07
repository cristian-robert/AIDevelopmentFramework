---
description: Mobile development rules — auto-loads when editing mobile/native files
globs: ["**/mobile/**", "**/native/**", "**/*.native.*", "**/expo/**"]
---

# Mobile Rules

## Skill chain
KB search → architect-RETRIEVE → Expo skill (per task table below) → context7 verify → mobile-tester-agent VERIFY/FLOW → KB update.

## Expo skill table
| Task | Skill |
|------|-------|
| Screens, components, navigation | `/expo-app-design:building-native-ui` |
| API calls, caching, offline | `/expo-app-design:native-data-fetching` |
| Tailwind/NativeWind setup | `/expo-app-design:expo-tailwind-setup` |
| Dev client, TestFlight | `/expo-app-design:expo-dev-client` |
| API routes (EAS Hosting) | `/expo-app-design:expo-api-routes` |
| Web in webview | `/expo-app-design:use-dom` |
| SwiftUI | `/expo-app-design:expo-ui-swift-ui` |
| Jetpack Compose | `/expo-app-design:expo-ui-jetpack-compose` |

## Load-bearing rules
- Expo Router file-based routing
- `.ios.tsx` / `.android.tsx` only when necessary
- Animations: `react-native-reanimated`
- Navigation state through Expo Router, not manual

## Critical checklist
- [ ] mobile-tester-agent VERIFY/FLOW on simulator after UI changes
- [ ] Platform-specific files justified
- [ ] KB wiki updated for new/changed screens or hooks

## References
- `.claude/references/code-patterns.md` — project mobile patterns
- `<kb-path>/wiki/_index.md` — search screen/navigation articles before building
