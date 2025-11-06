/**
 * T030: Integration test for exposure creation flow
 * Tests the complete user journey: camera → form → save → history
 * 
 * Run with: detox test --configuration ios.sim.debug
 */

import { device, element, by, expect as detoxExpect } from 'detox';

describe('Exposure Creation Flow (E2E)', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        camera: 'YES',
        location: 'always',
        microphone: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full exposure creation flow in under 60 seconds', async () => {
    const startTime = Date.now();

    // Step 1: Navigate to New Exposure screen via tab
    await detoxExpect(element(by.text('New'))).toBeVisible();
    await element(by.text('New')).tap();

    // Step 2: Select exposure type
    await detoxExpect(element(by.text('Exposure Type'))).toBeVisible();
    await element(by.text('Select exposure type...')).tap();
    
    // Select Silica Dust from modal
    await detoxExpect(element(by.text('Silica Dust'))).toBeVisible();
    await element(by.text('Silica Dust')).tap();

    // Step 3: Fill in work activity
    await element(by.id('workActivityInput')).typeText('Concrete cutting for foundation work');
    await element(by.id('workActivityInput')).tapReturnKey();

    // Step 4: Save exposure
    await element(by.text('Save Exposure')).tap();

    // Step 5: Verify success alert and navigate to history
    await detoxExpect(element(by.text('Success'))).toBeVisible();
    await element(by.text('OK')).tap();

    // Step 6: Verify exposure appears in list
    await detoxExpect(element(by.text('History'))).toBeVisible();
    await element(by.text('History')).tap();
    
    await detoxExpect(element(by.text('Silica Dust'))).toBeVisible();
    await detoxExpect(element(by.text('Concrete cutting for foundation work'))).toBeVisible();

    // Verify completion time
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Should complete in under 60 seconds (P1 requirement)
    if (duration >= 60) {
      throw new Error(`Exposure creation took ${duration}s, exceeds 60s target`);
    }
  });

  it('should capture photo and attach to exposure', async () => {
    // Navigate to New Exposure
    await element(by.text('New')).tap();

    // Mock camera capture (Detox doesn't support actual camera)
    // In real app, this would trigger camera via expo-camera
    await detoxExpect(element(by.id('capturePhotoButton'))).toBeVisible();
    await element(by.id('capturePhotoButton')).tap();

    // Verify photo preview appears
    await detoxExpect(element(by.id('photoPreview'))).toBeVisible();

    // Continue with form
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Welding Fumes')).tap();
    await element(by.id('workActivityInput')).typeText('Welding steel beams');
    
    // Save
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify photo count in history
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('📸 1 photo'))).toBeVisible();
  });

  it('should auto-capture GPS location', async () => {
    // Navigate to New Exposure
    await element(by.text('New')).tap();

    // Verify location indicator shows capturing
    await detoxExpect(element(by.text('Getting location...'))).toBeVisible();

    // Wait for location to be captured
    await waitFor(element(by.text('📍 Location captured')))
      .toBeVisible()
      .withTimeout(5000);

    // Complete form
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Asbestos (Class A)')).tap();
    await element(by.id('workActivityInput')).typeText('Asbestos removal');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify location appears in history
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('📍'))).toBeVisible(); // Location icon
  });

  it('should validate required fields', async () => {
    // Navigate to New Exposure
    await element(by.text('New')).tap();

    // Try to save without filling required fields
    await element(by.text('Save Exposure')).tap();

    // Should show validation error
    await detoxExpect(element(by.text('Required'))).toBeVisible();
    await detoxExpect(element(by.text('Please fill in exposure type and work activity'))).toBeVisible();
    
    await element(by.text('OK')).tap();
  });

  it('should support PPE selection', async () => {
    // Navigate to New Exposure
    await element(by.text('New')).tap();

    // Select exposure type
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Hazardous Chemicals')).tap();

    // Select PPE
    await element(by.id('ppeSelector')).tap();
    await element(by.text('Chemical Gloves')).tap();
    await element(by.text('Respirator P2')).tap();
    await element(by.text('Done')).tap();

    // Verify PPE selected
    await detoxExpect(element(by.text('2 PPE items selected'))).toBeVisible();

    // Complete form
    await element(by.id('workActivityInput')).typeText('Applying industrial adhesive');
    await element(by.id('chemicalNameInput')).typeText('Toluene-based adhesive');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();
  });

  it('should support severity selection', async () => {
    // Navigate to New Exposure
    await element(by.text('New')).tap();

    // Select exposure type
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Noise')).tap();

    // Select severity (default is low)
    await element(by.id('severitySelector')).tap();
    await element(by.text('High')).tap();

    // Verify severity selected
    await detoxExpect(element(by.id('severityBadge'))).toHaveText('HIGH');

    // Complete form
    await element(by.id('workActivityInput')).typeText('Operating jackhammer');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();
  });

  it('should cancel creation and discard changes', async () => {
    // Navigate to New Exposure
    await element(by.text('New')).tap();

    // Start filling form
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Mould')).tap();
    await element(by.id('workActivityInput')).typeText('Mould removal work');

    // Cancel
    await element(by.text('Cancel')).tap();

    // Should navigate back
    await detoxExpect(element(by.text('Home'))).toBeVisible();

    // Verify no exposure was created
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('Mould removal work'))).not.toBeVisible();
  });
});
