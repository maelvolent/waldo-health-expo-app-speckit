# Feature Specification: Waldo Health - Mobile Exposure Documentation Platform

**Feature Branch**: `001-waldo-health`
**Created**: 2025-11-06
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Quick Exposure Documentation (Priority: P1)

A construction worker needs to quickly document a workplace exposure during their workday without interrupting their workflow.

**Why this priority**: This is the core value proposition - if workers can't document exposures quickly and easily, they won't use the app and will continue to have incomplete records for ACC claims.

**Independent Test**: Can be fully tested by having a user create a complete exposure record (with photos, timestamp, location, and exposure type) in under 60 seconds and verify all data is accurately captured and stored.

**Acceptance Scenarios**:

1. **Given** a worker is on a construction site and encounters a health hazard, **When** they open the app and tap "Log Exposure", **Then** they can capture photos, select exposure type, and save a complete record with automatic timestamp and GPS location in under 60 seconds
2. **Given** a worker is wearing work gloves and has dirty hands, **When** they use voice entry mode, **Then** they can dictate exposure details hands-free and the app populates form fields automatically from speech recognition
3. **Given** a worker has no internet connection on site, **When** they create an exposure record, **Then** the app saves all data locally including photos and GPS coordinates, and syncs to cloud when connection is restored without data loss
4. **Given** a worker completes an exposure entry, **When** they save the record, **Then** the app displays success confirmation and the record appears immediately in their exposure history with all captured metadata intact

---

### User Story 2 - Professional Documentation Export for ACC Claims (Priority: P1)

A worker needs to provide comprehensive exposure history documentation to ACC to support a compensation claim related to occupational health conditions.

**Why this priority**: The entire purpose of documenting exposures is to have credible evidence for ACC claims. Without professional export capabilities, the app fails its primary mission.

**Independent Test**: Can be fully tested by creating multiple exposure records across different exposure types, generating a PDF export, and verifying it contains all required information in a professional format suitable for ACC submission.

**Acceptance Scenarios**:

1. **Given** a worker has logged multiple exposures over several months, **When** they select "Export PDF" and choose date range and exposure types, **Then** they receive a professionally formatted PDF with cover page, summary statistics, detailed exposure entries with embedded photos and maps, suitable for ACC submission
2. **Given** a worker needs to provide data in spreadsheet format, **When** they export to CSV, **Then** they receive a file containing all exposure fields (timestamp, type, location, GPS coordinates, duration, severity, PPE, notes) that opens correctly in Excel or Google Sheets
3. **Given** a worker generates an export, **When** they tap "Share", **Then** they can email directly from the app, save to phone storage, or upload to cloud storage (Google Drive, Dropbox) without technical difficulties
4. **Given** a worker needs to prove location of exposure, **When** they include maps in PDF export, **Then** each exposure entry shows an embedded map image with pin marking exact location and readable street address

---

### User Story 3 - Education and Hazard Awareness (Priority: P2)

A worker wants to learn about health hazards they may encounter and understand proper protective measures to prevent exposures.

**Why this priority**: Prevention is better than documentation. Educated workers protect themselves better and understand why documentation matters, leading to better health outcomes and more consistent app usage.

**Independent Test**: Can be fully tested by navigating the educational content library, reading articles about specific exposure types, viewing recommended PPE, and accessing WorkSafe NZ guidance links.

**Acceptance Scenarios**:

1. **Given** a worker encounters an unfamiliar material or situation, **When** they browse educational content by exposure type, **Then** they can read plain-language explanations of health risks, how to identify the hazard, and required protective equipment
2. **Given** a worker wants to learn about proper respirator use, **When** they search for "respirator" in the education section, **Then** they find detailed articles, videos, and quick reference cards explaining correct usage and selection
3. **Given** a worker is concerned about symptoms they're experiencing, **When** they access content about a specific exposure type, **Then** they see clear guidance on when to seek medical attention and what to tell their doctor
4. **Given** a worker wants to know their legal rights, **When** they browse the "Workers' Rights" section, **Then** they find information about the Health and Safety at Work Act, how to file ACC claims, and where to get help

---

### User Story 4 - AI-Powered Hazard Identification (Priority: P3)

A worker wants assistance identifying potential hazards in their work environment that they might not recognize on their own.

**Why this priority**: Enhances safety and encourages proactive documentation, but the core app functionality works without it. This is a value-add feature that differentiates from basic documentation tools.

**Independent Test**: Can be fully tested by taking photos of various construction scenarios (cutting concrete, visible asbestos materials, chemical containers, etc.) and verifying the AI provides appropriate hazard warnings and safety recommendations.

**Acceptance Scenarios**:

1. **Given** a worker points their camera at a concrete cutting operation, **When** they tap "Scan for Hazards", **Then** the AI detects silica dust risk, displays confidence level, explains why it's dangerous, and recommends dust suppression and P2/P3 respirator use
2. **Given** the AI identifies a potential hazard, **When** the analysis is complete, **Then** the worker can immediately create an exposure record from the scan results with one tap, pre-populating exposure type and attaching the analyzed photo
3. **Given** the AI cannot definitively identify a substance as asbestos, **When** it detects potential asbestos-containing materials, **Then** it shows strong disclaimer that professional assessment is required and provides link to licensed asbestos assessor directory
4. **Given** a worker scans their work area, **When** multiple hazards are detected, **Then** the app displays them ordered by severity with clear hierarchy of controls (elimination, substitution, engineering, administrative, PPE) for each

---

### User Story 5 - Location-Based Exposure Tracking and Patterns (Priority: P3)

A worker or safety manager wants to visualize exposure patterns across different work sites to identify high-risk locations and trends.

**Why this priority**: Valuable for safety management and personal awareness, but not essential for basic documentation or ACC claims. Enhances the app's utility for organizational use.

**Independent Test**: Can be fully tested by creating exposure records at different GPS locations, viewing them on map view, filtering by exposure type and date range, and verifying location suggestions work for repeat sites.

**Acceptance Scenarios**:

1. **Given** a worker has logged exposures at multiple construction sites, **When** they switch to Map View, **Then** they see all exposure locations displayed as color-coded pins on an interactive map with clustering for nearby exposures
2. **Given** a worker frequently returns to the same construction site, **When** they create a new exposure at that location, **Then** the app suggests the site name based on GPS proximity, reducing typing and ensuring consistent naming
3. **Given** a safety manager wants to identify high-risk sites, **When** they filter map view by exposure type (e.g., "Silica Dust" or "Asbestos"), **Then** they see only relevant exposures and can tap pins to see detailed summaries
4. **Given** a worker wants to review their exposure history geographically, **When** they view the map, **Then** they can tap any pin to see a preview card and tap again to view full exposure details with photos and all metadata

---

### Edge Cases

- **What happens when GPS is unavailable or inaccurate (indoor sites, basements, remote areas)?** The app allows manual location entry, saves GPS coordinates when available but doesn't block entry creation, and clearly indicates location accuracy level (excellent/good/fair/poor/manual entry)

- **How does the system handle photos taken in low light conditions or with camera issues?** The app saves any photo the device camera produces, preserves original EXIF data, allows users to retake photos before saving, and stores original quality images without compression that could reduce evidentiary value

- **What if a worker tries to create an exposure record but loses battery or the app crashes mid-entry?** The app auto-saves form data every 3 seconds to local storage, recovers draft entries on restart, and prompts user to continue or discard the incomplete entry

- **How does the app handle a worker who has been exposed to multiple hazards simultaneously?** The app supports creating separate exposure records for each hazard type (recommended approach for clear documentation), allows adding comprehensive notes describing multiple exposures, and makes it quick to create multiple records in succession

- **What happens if a worker's phone is lost, stolen, or damaged and they lose years of exposure history?** The app syncs all data to cloud storage when internet connection is available, requires user authentication to prevent unauthorized access, and allows workers to export and save backups regularly to external storage

- **How does the system handle date/time discrepancies (phone clock wrong, timezone issues)?** The app uses device system time at the moment of entry and allows users to manually edit date/time if they notice errors, clearly indicates timezone in exported records, and maintains timestamp metadata in ISO 8601 format for legal validity

- **What if WorkSafe NZ regulations change or new exposure types need to be added?** The app can be updated via standard app store updates to add new exposure categories, updated educational content reflects current regulations, and existing records remain valid even if categories are modified

- **How does the app handle privacy concerns from workers who don't want to share GPS locations?** The app allows users to control data sharing preferences, provides option to blur or generalize exact GPS coordinates in exports, keeps data on user's device until they explicitly choose to export, and clearly explains in privacy policy that location data is only for worker's own documentation

## Requirements

### Functional Requirements

**Core Exposure Documentation**

- **FR-001**: System MUST allow users to create exposure records containing date/time, exposure type (from 12 predefined categories), duration, location, severity level, PPE used, work activity description, and optional notes
- **FR-002**: System MUST automatically capture and store device timestamp (with user-editable option) and GPS coordinates when creating exposure records
- **FR-003**: System MUST support attaching 1-5 photos per exposure record with automatic preservation of EXIF metadata including timestamp and GPS coordinates from photo metadata
- **FR-004**: System MUST display interactive maps showing exposure location during entry with draggable pin for location adjustment and automatic address lookup from GPS coordinates
- **FR-005**: System MUST store all exposure data locally on device with offline capability and sync to cloud storage when internet connection is available

**Voice and Alternative Input**

- **FR-006**: System MUST provide voice entry mode that converts speech to text using NZ English recognition and automatically populates form fields from dictated content
- **FR-007**: System MUST support camera-first workflow allowing users to take photos immediately upon opening exposure entry and then fill minimal required details
- **FR-008**: System MUST auto-save form data every 3 seconds to prevent data loss from crashes or interruptions

**Data Export and Sharing**

- **FR-009**: System MUST generate PDF reports containing cover page, summary statistics, table of contents, and detailed exposure entries with embedded full-size photos and map images
- **FR-010**: System MUST export data to CSV format with all fields (timestamp, exposure type, location name, address, GPS coordinates, duration, severity, PPE used, notes, image file references)
- **FR-011**: System MUST allow users to filter exports by date range and exposure type, and toggle inclusion/exclusion of photos and maps in PDF exports
- **FR-012**: System MUST provide standard mobile sharing capabilities (email, save to files, cloud storage upload) for generated exports

**Educational Content**

- **FR-013**: System MUST provide educational content library browsable by exposure type (12 categories), work activity, or topic (PPE, regulations, rights, etc.)
- **FR-014**: System MUST display for each exposure type: health risks in plain language, hazard identification guidance, required PPE, WorkSafe NZ regulations, exposure limits, and when to seek medical attention
- **FR-015**: System MUST support search functionality across all educational content, bookmarking capability, and content sharing with other users

**AI Hazard Detection (Optional - Phase 3)**

- **FR-016**: System MUST analyze photos of work environments and identify potential hazards including: silica dust generation from cutting/grinding, potential asbestos materials, chemical containers, visible mould, welding fume risks, missing PPE, and other safety issues
- **FR-017**: System MUST display AI hazard detection results with confidence levels, hazard descriptions, why dangerous, recommended controls (hierarchy: elimination, substitution, engineering, administrative, PPE), and WorkSafe NZ requirements
- **FR-018**: System MUST include prominent disclaimers that AI is assistance only, cannot definitively identify asbestos (licensed assessor required), may miss hazards or produce false positives, and does not replace WorkSafe requirements
- **FR-019**: System MUST allow one-tap creation of exposure record from AI scan results with pre-populated exposure type and attached analyzed photo

**Location and Mapping**

- **FR-020**: System MUST capture GPS coordinates automatically using device location services (GPS, Wi-Fi, cellular positioning) and display accuracy indicator (excellent/good/fair/poor)
- **FR-021**: System MUST provide Map View showing all exposure records as color-coded pins (by exposure type) with clustering for nearby exposures and filter capability
- **FR-022**: System MUST suggest previously used site names when GPS is near a known location to enable consistent naming and reduce typing

**User Interface and Accessibility**

- **FR-023**: System MUST support both light mode (high contrast for bright sunlight) and dark mode (for low light safety) with automatic switching based on ambient light sensor and manual toggle
- **FR-024**: System MUST meet WCAG 2.1 AA accessibility standards minimum including: keyboard navigation, screen reader compatibility (VoiceOver/TalkBack), 4.5:1 color contrast for normal text, focus indicators, and semantic HTML with ARIA labels
- **FR-025**: System MUST use minimum 44x44 point touch targets for all interactive elements, support one-handed operation, and work with thick work gloves
- **FR-026**: System MUST support iOS Dynamic Type and Android font scaling up to 200% without breaking layout

**Performance and Reliability**

- **FR-027**: System MUST launch in under 2 seconds, complete screen transitions in under 300ms, and capture photos with instant shutter response
- **FR-028**: System MUST provide GPS lock within 5 seconds and display sync status indicators showing synced/syncing/pending states
- **FR-029**: System MUST work offline for all core functions: creating/saving exposure records, taking photos, viewing existing records, and accessing downloaded educational content
- **FR-030**: System MUST maintain app crash rate below 0.1% and achieve 4.5+ star average rating across iOS and Android app stores

**Data Privacy and Security**

- **FR-031**: System MUST comply with NZ Privacy Act 2020 including: clear privacy policy in plain language, user consent for data collection, right to access personal data, right to delete data, secure data storage, and no third-party data sharing without consent
- **FR-032**: System MUST allow users to export all personal data on request and delete account/all data with clear warnings about ACC claim implications
- **FR-033**: System MUST keep data on user's device until they explicitly choose to export or sync, with user controls over data sharing preferences

**Regulatory Compliance**

- **FR-034**: System MUST support 40-year record retention in line with NZ ACC Act 2001 medical records requirements
- **FR-035**: System MUST align educational content with current WorkSafe NZ regulations and update when regulations change
- **FR-036**: System MUST display appropriate disclaimers that app is a documentation tool (not medical advice), AI hazard detection is assistance only (not professional assessment), cannot definitively identify asbestos, does not replace WorkSafe requirements, provides no guarantee of ACC claim approval, and users are responsible for proper PPE use

**Advertising Integration (Phase 1 MVP)**

- **FR-037**: System MUST integrate Google AdMob with banner ads at bottom of non-critical screens and interstitial ads at natural break points (after saving exposure, when opening education section) with maximum 1 interstitial per session
- **FR-038**: System MUST never display ads during: exposure entry creation, emergency/safety-critical information viewing, hazard scanning, or export generation
- **FR-039**: System MUST implement strict content policy for ads: no alcohol, gambling, or inappropriate content; preference for relevant advertisers (safety equipment, construction supplies)

### Key Entities

**Exposure Record**
- Core data model capturing workplace health exposure event
- Attributes: unique ID, user ID, timestamp (device time, user-editable), exposure type (enum from 12 categories), duration (hours/minutes), location name (text), GPS coordinates (latitude/longitude), address (reverse geocoded from GPS), severity level (low/medium/high), PPE used (multi-select checkboxes), work activity description, notes (free text), optional chemical name, optional SDS reference number, optional control measures taken
- Relationships: One-to-many with Photos (1-5 photos per record), belongs to User
- Lifecycle: Created locally on device, synced to cloud when online, exportable to PDF/CSV, retained for 40 years or until user deletion

**Photo**
- Visual evidence attached to exposure record
- Attributes: unique ID, exposure record ID, image file (full quality), EXIF metadata (timestamp, GPS coordinates, camera settings), capture timestamp, optional annotations (text/drawings)
- Relationships: Belongs to Exposure Record
- Lifecycle: Captured via device camera, stored locally immediately, synced to cloud storage, embedded in PDF exports, referenced in CSV exports by filename

**User**
- Construction worker, safety officer, or contractor using the app
- Attributes: unique ID, name, email (authentication), trade/role, privacy settings (data sharing preferences, location blurring options), notification preferences, display preferences (dark mode, text size), authentication credentials, ACC integration toggle (opt-in)
- Relationships: One-to-many with Exposure Records, one-to-many with Bookmarks
- Lifecycle: Created during registration/onboarding, authenticated via email/password or social login, can export all personal data, can delete account and all associated data

**Educational Content Item**
- Article, video, or reference material about health hazards
- Attributes: unique ID, title, content type (article/video/infographic/quick-reference), exposure type category (one of 12), topic tags (PPE, regulations, rights, first aid, etc.), content body/URL, estimated read time, publication date, last updated date, WorkSafe NZ guidance links
- Relationships: Many-to-many with Users (via Bookmarks)
- Lifecycle: Created/updated by content management system, downloaded to device for offline access (user-initiated), searchable, shareable

**Location/Site**
- Frequently visited construction site with smart suggestions
- Attributes: unique ID, site name (user-provided), GPS coordinates (centroid of visits), address, visit count, last visited timestamp
- Relationships: Referenced by multiple Exposure Records
- Lifecycle: Auto-created when user logs exposure at new location, updated with each visit, suggested when GPS is nearby (geofence)

**Hazard Scan Result (Phase 3)**
- Output from AI image analysis of work environment
- Attributes: unique ID, analyzed photo, detected hazards (array of hazard objects with: hazard type, confidence level, severity, description, recommended controls, WorkSafe links), scan timestamp
- Relationships: Can generate new Exposure Record
- Lifecycle: Created from AI analysis, displayed to user with disclaimers, optionally saved, can be converted to exposure record

## Success Criteria

### Measurable Outcomes

**Adoption and Engagement**

- **SC-001**: 10,000+ app downloads achieved within first 12 months of launch across iOS and Android platforms in New Zealand
- **SC-002**: 60% of users remain active (create at least 1 exposure record) 30 days after first use
- **SC-003**: Average 3 or more exposure records created per active user per week demonstrating consistent documentation habits
- **SC-004**: 80% or more of exposure records include at least 1 attached photo providing visual evidence
- **SC-005**: 95% or more of exposure records successfully capture GPS location data (excluding cases where GPS is deliberately disabled by user)

**User Experience Quality**

- **SC-006**: Users can complete an exposure entry (select type, take 1 photo, save) in under 60 seconds from app launch without training
- **SC-007**: App maintains 4.5 or higher average star rating across iOS App Store and Android Play Store
- **SC-008**: Less than 5% of app store reviews are negative (1-2 stars) indicating high user satisfaction
- **SC-009**: App crash rate remains below 0.1% across all users and devices
- **SC-010**: 70% or more of users indicate they would recommend the app to colleagues in satisfaction surveys

**Feature Utilization**

- **SC-011**: 40% or more of active users utilize voice entry mode at least once, demonstrating value of hands-free option for workers wearing gloves
- **SC-012**: 60% or more of users with 5+ exposure records use Map View to visualize their exposure history geographically
- **SC-013**: 50% or more of users access educational content at least once per month demonstrating value of prevention-focused information
- **SC-014**: Workers who use the app generate PDF exports averaging 1 export per 50 logged exposures, indicating preparation for ACC claims

**Business Outcomes**

- **SC-015**: Revenue per user reaches $0.50 or more per month from advertising while maintaining non-intrusive ad placement
- **SC-016**: Customer acquisition cost remains under $5 per user through organic growth and targeted campaigns
- **SC-017**: 5 or more major NZ construction companies adopt the app for their teams (organizational licenses) within first 18 months
- **SC-018**: ACC endorses or partners with the app as a recognized tool for exposure documentation within first 24 months

**Impact on Worker Health and Safety**

- **SC-019**: Measurable increase in ACC claims filed with comprehensive exposure documentation (photos, locations, dates) compared to baseline of handwritten logs
- **SC-020**: Reduction in rejected ACC claims due to insufficient evidence among app users compared to workers using traditional documentation methods
- **SC-021**: Positive testimonials from ACC case managers noting improved quality and completeness of exposure documentation from app users
- **SC-022**: WorkSafe NZ or construction industry safety associations recognize or feature the app as a best practice tool for health hazard documentation

## Assumptions

1. **Platform Assumptions**:
   - Target devices are smartphones running iOS 15+ or Android 10+ with camera, GPS, and internet connectivity
   - Users have basic smartphone literacy (can navigate apps, take photos, use email)
   - Device storage is sufficient for typical usage (estimate 500 MB for app + 100-200 exposure records with photos)

2. **Regulatory Assumptions**:
   - Current NZ Privacy Act 2020, Health and Safety at Work Act 2015, and ACC Act 2001 remain substantially unchanged during development
   - WorkSafe NZ educational content and exposure limits can be referenced and linked without licensing restrictions
   - ACC does not currently provide a digital submission API, so manual export and submission is the primary method

3. **User Behavior Assumptions**:
   - Construction workers will adopt mobile-first documentation if the process is significantly faster and easier than handwritten logs
   - Workers prioritize speed and simplicity over comprehensive detail, so progressive disclosure and smart defaults are critical
   - Workers wearing PPE (gloves, respirators) need alternative input methods beyond typing
   - Visual evidence (photos) is more compelling and credible for ACC claims than text descriptions alone

4. **Technical Assumptions**:
   - Cloud storage for syncing is via standard mobile backend-as-a-service (Firebase, AWS Amplify, or similar)
   - AI hazard detection uses computer vision APIs (Google Cloud Vision, AWS Rekognition, or custom trained models)
   - Voice-to-text uses platform-native speech recognition APIs with NZ English support
   - PDF generation can be performed on-device using mobile PDF libraries without server-side processing
   - Maps can be displayed using Google Maps SDK for mobile with appropriate API key and usage limits

5. **Business Model Assumptions**:
   - Free app with advertising generates sufficient revenue to cover operational costs and ongoing development
   - Construction workers (individuals) are price-sensitive and unwilling to pay subscription fees for safety/documentation tools
   - Organizations (construction companies) may pay for premium/ad-free licenses for their employees in Phase 4
   - Advertising targeting construction industry (safety equipment, tools, supplies) achieves higher CPM than generic ads

6. **Content Assumptions**:
   - Educational content about 12 exposure types can be created by subject matter experts or sourced from WorkSafe NZ materials
   - Content requires periodic updates as regulations change but core health hazard information is relatively stable
   - Video content hosting (if included) uses YouTube or similar platform to avoid storage/bandwidth costs

7. **AI/ML Assumptions (Phase 3)**:
   - Computer vision can identify common construction hazards with 70-85% confidence when visible in photos
   - Definitive asbestos identification is not possible from photos alone (always requires lab testing)
   - AI accuracy improves over time with user feedback and additional training data
   - Legal liability for false negatives (missed hazards) is mitigated by clear disclaimers that AI is assistance only

8. **Data Retention Assumptions**:
   - 40-year retention aligns with NZ medical records requirements for potential occupational disease claims filed decades after exposure
   - Users understand retention importance and don't delete records prematurely
   - Cloud storage costs for 40-year retention are manageable given primarily text data with photo compression options

9. **Offline Functionality Assumptions**:
   - Construction sites frequently have poor or no cellular connectivity requiring robust offline capability
   - Local device storage is sufficient for 30-50 exposure records before sync required
   - GPS location can be captured even without internet (coordinates obtained, address resolved later)
   - Users understand and accept sync delays when offline for extended periods

10. **Accessibility Assumptions**:
    - WCAG 2.1 AA is minimum acceptable standard for government/public sector compliance in NZ
    - Construction workers may have vision impairments from sun exposure or safety incidents requiring high contrast and large text options
    - Touch targets larger than standard (48dp minimum vs typical 44dp) accommodate glove use and motor precision variations

## Out of Scope

The following are explicitly excluded from this feature specification:

1. **Multi-platform beyond mobile**: Desktop web application, browser extension, or standalone desktop software
2. **Real-time monitoring**: Integration with wearable sensors, environmental monitors (noise meters, dust sensors) for automatic exposure detection
3. **Organization management features in Phase 1**: Team dashboards, admin controls, safety manager views, bulk organizational exports (deferred to Phase 4)
4. **Integration with other tools**: Calendar sync, project management tools (Procore, Buildertrend), time tracking systems
5. **Health symptom tracking**: Logging of symptoms, medical appointments, or health outcomes (focused purely on exposure documentation)
6. **Direct ACC claim submission**: Automated electronic filing with ACC (API does not exist; manual submission via export is in scope)
7. **Social features**: User profiles, sharing exposure records with coworkers, commenting, or community features
8. **Multi-language support in Phase 1**: Initially English only; Māori and Pacific language support deferred to Phase 4
9. **Wearable app versions**: Apple Watch, Android Wear OS apps (mobile phone is primary device)
10. **Custom exposure categories**: Users cannot create their own exposure types beyond the 12 predefined categories
11. **Advanced analytics**: Trend analysis, exposure heatmaps, predictive hazard warnings (basic map view is in scope; advanced analytics deferred)
12. **Third-party API integrations**: No integrations with external systems beyond Google Maps, advertising networks, and cloud storage
13. **E-commerce functionality**: No in-app purchases of safety equipment, PPE, or related products (may be future partnership opportunity)
14. **Medical advice or health assessments**: App provides education and documentation only, not diagnosis or treatment recommendations
15. **Chemical database integration**: No automatic SDS lookups or chemical hazard database connections (users enter chemical names manually)
16. **Barcode/QR scanning in Phase 1**: No automatic SDS or chemical identification from product barcodes (deferred to Phase 2)
17. **Geofencing notifications in Phase 1**: No automatic prompts to log exposures when entering known hazardous sites (deferred to Phase 3)
18. **Exposure sharing with medical professionals**: No secure messaging or FHIR integration with healthcare systems (users export and share PDF/CSV manually)
19. **Regulatory reporting**: No automatic reporting to WorkSafe NZ or other government agencies
20. **White-label or multi-tenant versions**: Single unified app for all users; organizational customization deferred to future versions

## Dependencies

1. **External Services**:
   - Google Maps SDK for mobile (or alternative mapping provider) for map display and geocoding
   - Cloud storage backend (Firebase, AWS, or similar) for data sync and backup
   - Speech recognition API supporting NZ English dialect
   - Computer vision API for AI hazard detection (Phase 3)
   - Google AdMob or alternative advertising network for monetization

2. **Platform Requirements**:
   - iOS App Store approval and compliance with Apple Developer Program
   - Google Play Store approval and compliance with Android Developer Program
   - Access to device camera, GPS, and local storage permissions

3. **Legal and Regulatory**:
   - Privacy policy review and approval by legal counsel for NZ Privacy Act 2020 compliance
   - Terms of service review covering liability limitations and disclaimer language
   - Professional liability and cyber liability insurance coverage
   - WorkSafe NZ permission to link to or reference their educational materials (if required)

4. **Content Creation**:
   - Subject matter experts (occupational health professionals, safety consultants) to create/validate educational content
   - Photo/video assets depicting real construction scenarios for educational content
   - Legal review of all health and safety guidance to ensure accuracy and avoid liability

5. **Third-party Data**:
   - WorkSafe NZ exposure limits, regulations, and guidance documents (publicly available)
   - NZ construction industry statistics for user research and market sizing
   - ACC claim process documentation and requirements (publicly available)

6. **Infrastructure**:
   - Cloud hosting for backend services (user authentication, data sync)
   - CDN for serving educational content (videos, images, articles)
   - Monitoring and analytics platform (Crashlytics, App Center, or similar)
   - Version control and CI/CD pipeline for mobile app builds

7. **Development Tools**:
   - iOS development environment (Xcode, Swift or React Native)
   - Android development environment (Android Studio, Kotlin or React Native)
   - PDF generation library for mobile platforms
   - Image processing library for photo handling and EXIF preservation
   - Database/ORM for local storage (SQLite, Realm, or similar)

8. **Testing Dependencies**:
   - Real construction workers for user acceptance testing and beta program
   - Construction company partners willing to pilot the app with their teams
   - Test devices representing range of iOS and Android versions, screen sizes
   - ACC case managers willing to provide feedback on export format quality (if possible)

9. **Business Relationships**:
   - Relationship with construction industry associations for marketing and distribution
   - Potential partnership discussions with ACC for future integration or endorsement
   - Advertising network agreements for revenue generation
