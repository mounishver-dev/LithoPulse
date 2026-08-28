# LithoPulse — Disaster Intelligence Network
### React Native · Expo SDK 56 · MVP

A dual-interface disaster management app for NDMA/SDMA officials and at-risk citizens.

---

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Fix Expo-specific package versions (important!)
npx expo install --fix

# 3. Start development server
npx expo start
```

Then scan the QR code with the **Expo Go** app (iOS / Android).

---

## 🔐 Login Credentials

### Official Access (pre-provisioned — no registration)
| Username | Password | Role |
|---|---|---|
| `dm_mizoram` | `NDMA@2025` | District Magistrate |
| `sdma_assam` | `SDMA@secure` | SDMA Official |
| `eoc_ndrf` | `EOC@ndrf1` | EOC Operator |

### Citizen Access
Register a new account from the login screen. Your district is **auto-detected via GPS** — no manual entry required.

---

## 📱 App Structure

```
app/
├── (auth)/         login + register
├── (citizen)/      Alerts · Evacuate · Report · Network
└── (official)/     Triage · Terrain · Analytics · Dispatch · Incidents
```

---

## 🛠 Tech Stack
- **Framework**: React Native + Expo SDK 56
- **Navigation**: Expo Router (file-based)
- **State**: Zustand + AsyncStorage
- **Maps**: react-native-maps
- **Charts**: Custom SVG via react-native-svg
- **Animations**: react-native-reanimated
- **Location**: expo-location (GPS + reverse geocoding)
- **Camera**: expo-camera (CameraView)

---

## 📦 Key Packages to Install

If `npm install` doesn't pull all packages, run:

```bash
npx expo install expo-location expo-camera expo-sensors expo-linear-gradient expo-haptics react-native-maps react-native-svg react-native-reanimated react-native-gesture-handler react-native-safe-area-context @expo-google-fonts/inter @react-native-async-storage/async-storage zustand
```

---

## ⚠️ Notes
- **Maps** use `react-native-maps` (works in Expo Go). For production, add a Google Maps API key in `app.json`.
- **BLE Mesh** is simulated UI — real BLE requires a custom dev client build.
- **Camera** requires physical device (not simulator).
- Alerts are proximity-sorted by GPS distance from the user's current location.
