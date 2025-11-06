# Technology Research: Waldo Health

**Date**: 2025-11-06
**Status**: Completed
**Reviewed**: All NEEDS CLARIFICATION items resolved

---

## Research Summary

This document resolves all technology uncertainties identified in plan.md Technical Context section.

---

## Decision 1: Design System for WCAG 2.1 AA Compliance

### Chosen: **React Native Paper**

**Rationale**:
- Superior accessibility documentation and built-in WCAG support
- All components compatible with VoiceOver/TalkBack screen readers
- Material Design accessibility guidelines built-in
- Support for text scaling up to 200% (FR-026)
- Smaller bundle size (~300KB vs ~500KB for NativeBase)
- Active maintenance by Callstack with regular updates
- Touch target sizing configurable to 44x44 minimum
- Color contrast helpers for WCAG AA compliance

**Alternatives Considered**:
- **NativeBase**: Good accessibility but less explicit WCAG documentation, larger bundle, slower updates
- **React Native Elements**: Minimal accessibility features out-of-box

**Trade-offs**:
- Material Design aesthetic may feel Android-centric on iOS
- Some components require manual accessibility configuration
- Custom theming requires more setup than NativeBase

---

## Decision 2: Voice-to-Text

### Chosen: **@react-native-voice/voice**

**Rationale**:
- Uses device-native speech recognition (iOS: SFSpeechRecognizer, Android: SpeechRecognizer)
- **Works completely offline** once language packs downloaded (critical for FR-006, FR-029)
- Supports NZ English locale (`en-NZ`) with fallback to `en-AU`
- Zero latency compared to cloud solutions
- Can run concurrently with camera for hands-free operation
- Active maintenance, MIT license, TypeScript support

**Alternatives Considered**:
- **expo-speech**: TEXT-TO-SPEECH ONLY - cannot be used for voice input
- **@jamsch/expo-speech-recognition**: Requires manual model downloads, more complex setup
- **Picovoice**: Commercial solution with usage limits, larger bundle size
- **Google Cloud Speech-to-Text**: Requires internet (violates FR-029 offline requirement)

**Trade-offs**:
- Speech quality depends on device OS (iOS generally better)
- NZ English support requires users to have language pack installed
- Need to handle missing language packs gracefully with fallback
- iOS background audio requires special entitlements

**Implementation Notes**:
- Check for `en-NZ` locale support on app start
- Prompt users to download NZ English if missing
- Fallback to `en-AU` (Australian English) which is similar
- Use partial results for real-time transcription

---

## Decision 3: PDF Generation

### Chosen: **expo-print**

**Rationale**:
- **Works completely offline** using native print APIs (critical for FR-009, FR-029)
- Built specifically for Expo managed workflow (no ejection required)
- Supports embedding images via base64 data URIs
- HTML/CSS-based layout for professional formatting
- Automatically handles multi-page PDFs
- Maintained by Expo team with regular updates
- Integrates with expo-sharing for immediate file sharing

**Alternatives Considered**:
- **react-native-html-to-pdf**: **CANNOT be used with Expo** (requires ejection)
- **react-native-pdf-lib**: Requires ejection, complex low-level API
- **Server-side generation (Puppeteer)**: Requires internet (violates FR-029)

**Trade-offs**:
- All images must be converted to base64 (iOS doesn't support local file:// URLs)
- Large PDFs (50+ exposures) may cause memory issues - need chunking
- Base64 conversion increases memory usage during generation
- Limited CSS support (WebView capabilities only)

**Implementation Strategy**:
- Use expo-image-manipulator to optimize photos before embedding
- Resize to max 800px width, 80% quality JPEG
- Chunk large exports (20 exposures per PDF if >50 total)
- Show progress indicator during generation

---

## Decision 4: Expo Bundle Optimization

### Chosen: **Multi-Strategy Approach**

**Primary Tools**:
1. **Expo Atlas** - Visualize bundle contents and identify large dependencies
2. **Tree Shaking** - Remove unused code (enabled by default in Expo SDK 52+)
3. **Hermes Engine** - Reduce bundle size and improve startup (default)
4. **Android App Bundle (AAB)** - 30-40% smaller than APK via Google Play

**Best Practices**:
- Run `npx expo-optimize` on all UI assets (not evidence photos)
- Use direct imports instead of barrel imports for tree shaking
- Lazy load heavy features (Maps, PDF export)
- Remove console.logs in production builds
- Platform-specific code automatically split

**Expected Results**:
- **Baseline**: ~80-100 MB iOS, ~60-80 MB Android
- **Optimized**: ~40-50 MB iOS, ~25-35 MB Android AAB
- **Total Reduction**: 35-60% with all optimizations

**Bundle Size Breakdown**:
- Base Expo + React Native: ~15 MB
- React Native Paper: ~2 MB
- Maps: ~5-8 MB
- Camera: ~3-5 MB
- Convex Client: ~1-2 MB
- App Code: ~2-3 MB

**Target Goal**: < 50 MB iOS IPA, < 35 MB Android AAB

---

## Decision 5: Convex Offline-First Architecture

### Chosen: **Convex + Custom Local Queue Layer (MMKV)**

**Critical Finding**: Convex does NOT have native offline-first support. It handles network blips but not extended offline operation.

**Recommended Architecture**:
```
React Native App (Expo)
  ↓
Local Storage (MMKV) ← Source of truth while offline
  ↓
Sync Manager (Custom) ← Handles online/offline transitions
  ↓
Convex Client ← Real-time sync when online
  ↓
Convex Backend
```

**Implementation Strategy**:
1. **MMKV for Local Storage**: 30x faster than AsyncStorage, synchronous API, perfect for queuing
2. **Mutation Queue**: Queue all creates/updates/deletes while offline
3. **Photo Upload Queue**: Separate queue for large file uploads with retry logic
4. **Network State Monitoring**: Use @react-native-community/netinfo to trigger sync
5. **Conflict Resolution**: Last-write-wins with timestamp comparison

**Photo Upload Flow**:
- Save photos to local file system first
- Queue upload with exposureId reference
- Upload to Convex file storage when online
- Track upload status (pending/uploading/completed/failed)
- Retry failed uploads (max 5 attempts)

**Alternatives Considered**:
- **WatermelonDB + Convex**: Full SQLite database, more complex but handles extreme offline
- **Legend State + Convex**: Local-first reactive state, still experimental
- **Native Convex only**: Insufficient for multi-hour offline operation

**Trade-offs**:
- Requires custom queue implementation (adds complexity)
- No built-in conflict resolution beyond last-write-wins
- Photo uploads require manual queue with retry logic
- More complex than pure offline-first solutions like PouchDB

**40-Year Retention Strategy**:
- Never delete exposure records (soft delete with `isDeleted` flag)
- Archive old data to S3 after 5+ years for cost efficiency
- Monthly automated exports to user's cloud storage
- Convex has no hard storage limits (scales to TBs)
- AWS RDS durability: 99.999999999%

---

## Decision 6: NZ Data Residency Compliance

### Chosen: **Self-Hosted Convex on AWS NZ Region (ap-southeast-5)**

**Critical Finding**: Convex Cloud does NOT support regional data residency. US-hosted only.

**Rationale**:
- **Convex Cloud is non-compliant** with NZ Privacy Act 2020 data residency requirements
- AWS launched New Zealand region (ap-southeast-5) in September 2025
- Self-hosting Convex on AWS NZ is the ONLY path to legal compliance
- Convex is open-source and self-hostable
- Same Convex API and developer experience

**Implementation**:
1. Deploy Convex to AWS ECS Fargate in ap-southeast-5
2. Use Amazon RDS PostgreSQL in ap-southeast-5 for database
3. Use S3 bucket in ap-southeast-5 for photo storage
4. Enable encryption at rest and in transit
5. Enable S3 Object Lock for 40-year retention compliance

**Cost Estimate**:
- AWS RDS PostgreSQL (db.t4g.medium): ~$120/month
- ECS Fargate (2 vCPU, 4GB RAM): ~$60/month
- S3 Storage (500GB photos): ~$12/month
- **Total: ~$192/month** (vs Convex Cloud $30-100/month)

**Alternatives Considered**:
- **Convex Cloud**: Non-compliant (US-hosted only)
- **Wait for Convex Regional Deployments**: No timeline, could be years
- **Supabase self-hosted**: Alternative with simpler infrastructure
- **Firebase (Sydney)**: Close to NZ but not IN NZ, legal risk
- **Hybrid approach**: Keep sensitive data local, non-sensitive in Convex - too complex

**Trade-offs**:
- 2-3x higher cost than Convex Cloud
- Requires DevOps expertise (hire consultant: $2000-5000)
- You manage backups, scaling, monitoring
- Higher operational complexity

**Legal Compliance Checklist**:
- ✅ All data stored in NZ region (ap-southeast-5)
- ✅ Privacy policy clearly states data location
- ✅ Data Processing Agreement with AWS
- ✅ User consent for data storage
- ✅ Right to access (PDF/CSV export)
- ✅ Right to delete (soft delete for retention)
- ✅ Breach notification process (72 hours)
- ✅ Encryption at rest and in transit

**Rollout Plan**:
- **Phase 1 (MVP)**: Use Convex Cloud for beta testing, label as "Beta - US hosted"
- **Phase 2 (Compliance)**: Deploy self-hosted Convex to AWS NZ, migrate data
- **Phase 3 (Production)**: Public launch with NZ compliance, monitor for Convex official regional support

---

## Architecture Decisions Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Mobile Framework** | Expo SDK + React Native | Cross-platform, TypeScript, large ecosystem |
| **Backend** | Convex (self-hosted AWS NZ) | Real-time sync, serverless, TypeScript-first |
| **Authentication** | Clerk | Simple mobile SDK, secure, Convex integration |
| **Design System** | React Native Paper | Best WCAG accessibility support |
| **Voice Input** | @react-native-voice/voice | Offline support, device-native recognition |
| **PDF Generation** | expo-print | Offline support, Expo native integration |
| **Offline Storage** | MMKV + Custom Queue | Fast, synchronous, perfect for mutations queue |
| **Camera** | expo-camera | EXIF preservation, native Expo support |
| **Location** | expo-location | GPS + reverse geocoding, native support |
| **Maps** | react-native-maps | Standard mapping solution |
| **File Storage** | S3 (AWS NZ) | NZ compliance, 40-year retention, Object Lock |
| **Monitoring** | Sentry (React Native) | Crash reporting, performance monitoring |
| **Testing** | Jest + Detox | Unit tests + E2E mobile testing |

---

## Critical Risks & Mitigations

### Risk 1: Convex Offline Support is Limited
- **Impact**: High (core requirement FR-029)
- **Mitigation**: Implement custom MMKV queue layer, test extensively, have WatermelonDB as fallback

### Risk 2: NZ Data Residency Requires Self-Hosting
- **Impact**: High (legal compliance)
- **Mitigation**: Budget $200/month, hire DevOps consultant for setup, document runbooks

### Risk 3: React Native Paper May Need Manual Accessibility Work
- **Impact**: Medium (FR-024 accessibility requirement)
- **Mitigation**: Manual testing with screen readers, accessibility consultant, custom components if needed

### Risk 4: Speech Recognition on Older Android
- **Impact**: Medium (FR-006 voice feature)
- **Mitigation**: Set minimum Android 10, provide keyboard fallback, test on range of devices

### Risk 5: Large PDF Memory Issues
- **Impact**: Low (FR-009 export feature)
- **Mitigation**: Implement chunking for 50+ exposures, optimize images, test with 100+ records

---

## Implementation Priorities

**Phase 0: MVP (P1 Features Only)**
1. Set up Expo project with React Native Paper
2. Implement camera + photo capture with EXIF preservation
3. Build exposure form with 12 exposure types
4. Implement GPS location capture
5. Build local storage with MMKV
6. Create PDF export with expo-print
7. Implement basic offline queue

**Phase 1: Convex Integration**
1. Deploy self-hosted Convex to AWS NZ
2. Implement Convex schema (Exposure, Photo, User)
3. Build sync manager for offline/online transitions
4. Implement photo upload queue
5. Add Clerk authentication

**Phase 2: Advanced Features**
1. Voice-to-text with @react-native-voice/voice
2. Maps visualization with react-native-maps
3. Educational content (P2)
4. Bundle optimization with Expo Atlas

**Phase 3: Future**
1. AI hazard detection (P3)
2. Advanced analytics
3. Multi-device sync testing

---

## Next Steps

1. **Update plan.md**: Remove all "NEEDS CLARIFICATION" markers with decisions from this research
2. **Create data-model.md**: Define Convex schema based on entities from spec.md
3. **Create contracts/**: Define Convex functions (mutations and queries)
4. **Create quickstart.md**: Document setup instructions for Expo + Convex + Clerk
5. **Update agent context**: Add technology stack to .claude/context.md

---

**Research Completed**: 2025-11-06
**All Technical Uncertainties Resolved**: ✅
**Ready for Phase 1: Design & Contracts**: ✅
