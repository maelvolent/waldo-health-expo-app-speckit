/**
 * T031: Integration test for offline creation and sync
 * Tests offline-first functionality and background sync
 * 
 * Run with: detox test --configuration ios.sim.debug
 */

import { device, element, by, expect as detoxExpect } from 'detox';

describe('Offline Sync Flow (E2E)', () => {
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

  it('should create exposure offline and sync when online', async () => {
    // Step 1: Go offline
    await device.setNetworkConditions('offline');
    
    // Verify offline indicator
    await detoxExpect(element(by.text('🔴 Offline'))).toBeVisible();

    // Step 2: Create exposure while offline
    await element(by.text('New')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Contaminated Soils')).tap();
    await element(by.id('workActivityInput')).typeText('Excavation work in contaminated area');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Step 3: Verify exposure saved locally
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('Contaminated Soils'))).toBeVisible();
    
    // Verify pending sync indicator
    await detoxExpect(element(by.text('🔴 Offline (1 pending)'))).toBeVisible();

    // Step 4: Go back online
    await device.setNetworkConditions('wifi');
    
    // Wait for sync to complete
    await waitFor(element(by.text('🟢 Online')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify pending count cleared
    await detoxExpect(element(by.text('(1 pending)'))).not.toBeVisible();
  });

  it('should queue multiple exposures offline', async () => {
    // Go offline
    await device.setNetworkConditions('offline');

    // Create first exposure
    await element(by.text('New')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Heat Stress')).tap();
    await element(by.id('workActivityInput')).typeText('Outdoor work in summer');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Create second exposure
    await element(by.text('New')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Biological Hazards')).tap();
    await element(by.id('workActivityInput')).typeText('Wastewater facility work');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify both queued
    await detoxExpect(element(by.text('🔴 Offline (2 pending)'))).toBeVisible();

    // Go online and sync
    await device.setNetworkConditions('wifi');
    
    await waitFor(element(by.text('🟢 Online')))
      .toBeVisible()
      .withTimeout(15000);

    // Verify both synced
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('Heat Stress'))).toBeVisible();
    await detoxExpect(element(by.text('Biological Hazards'))).toBeVisible();
  });

  it('should handle photo upload offline with retry', async () => {
    // Go offline
    await device.setNetworkConditions('offline');

    // Create exposure with photo
    await element(by.text('New')).tap();
    await element(by.id('capturePhotoButton')).tap();
    
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Radiation')).tap();
    await element(by.id('workActivityInput')).typeText('X-ray inspection work');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify photo queued for upload
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('📸 1 photo (pending)'))).toBeVisible();

    // Go online
    await device.setNetworkConditions('wifi');
    
    // Wait for photo upload
    await waitFor(element(by.text('📸 1 photo')))
      .toBeVisible()
      .withTimeout(15000);

    // Pending indicator should be gone
    await detoxExpect(element(by.text('(pending)'))).not.toBeVisible();
  });

  it('should preserve data integrity during offline operations', async () => {
    // Go offline
    await device.setNetworkConditions('offline');

    // Create exposure with all fields
    await element(by.text('New')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Welding Fumes')).tap();
    
    await element(by.id('workActivityInput')).typeText('Welding steel beams');
    await element(by.id('notesInput')).typeText('Heavy fume exposure in confined space');
    await element(by.id('controlMeasuresInput')).typeText('Local exhaust ventilation, P2 respirator');
    
    await element(by.id('severitySelector')).tap();
    await element(by.text('High')).tap();
    
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify all data saved
    await element(by.text('History')).tap();
    await element(by.text('Welding Fumes')).tap();
    
    // Verify exposure detail screen shows all fields
    await detoxExpect(element(by.text('Welding steel beams'))).toBeVisible();
    await detoxExpect(element(by.text('Heavy fume exposure in confined space'))).toBeVisible();
    await detoxExpect(element(by.text('Local exhaust ventilation, P2 respirator'))).toBeVisible();
    await detoxExpect(element(by.text('HIGH'))).toBeVisible();

    // Go online and sync
    await device.navigateBack();
    await device.setNetworkConditions('wifi');
    
    await waitFor(element(by.text('🟢 Online')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify data integrity after sync
    await element(by.text('History')).tap();
    await element(by.text('Welding Fumes')).tap();
    
    await detoxExpect(element(by.text('Welding steel beams'))).toBeVisible();
    await detoxExpect(element(by.text('Heavy fume exposure in confined space'))).toBeVisible();
  });

  it('should handle network interruption during sync', async () => {
    // Start offline
    await device.setNetworkConditions('offline');

    // Create exposure
    await element(by.text('New')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Meth Contamination')).tap();
    await element(by.id('workActivityInput')).typeText('Meth lab decontamination');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Go online briefly
    await device.setNetworkConditions('wifi');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate network interruption during sync
    await device.setNetworkConditions('offline');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Restore connection
    await device.setNetworkConditions('wifi');

    // Wait for successful sync
    await waitFor(element(by.text('🟢 Online')))
      .toBeVisible()
      .withTimeout(15000);

    // Verify exposure synced successfully
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('Meth Contamination'))).toBeVisible();
    await detoxExpect(element(by.text('🔴 Offline'))).not.toBeVisible();
  });

  it('should show sync status in real-time', async () => {
    // Start offline
    await device.setNetworkConditions('offline');
    
    // Create exposure
    await element(by.text('New')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Mould')).tap();
    await element(by.id('workActivityInput')).typeText('Mould remediation');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify offline status visible
    await detoxExpect(element(by.text('🔴 Offline (1 pending)'))).toBeVisible();

    // Go online and watch sync status update
    await device.setNetworkConditions('wifi');

    // Status should update to syncing
    await waitFor(element(by.text('Syncing...')))
      .toBeVisible()
      .withTimeout(2000);

    // Then to online
    await waitFor(element(by.text('🟢 Online')))
      .toBeVisible()
      .withTimeout(10000);

    // Pending count should clear
    await detoxExpect(element(by.text('(1 pending)'))).not.toBeVisible();
  });

  it('should retry failed uploads with exponential backoff', async () => {
    // This test verifies the retry logic in photo upload queue
    // Start offline to simulate failed upload
    await device.setNetworkConditions('offline');

    // Create exposure with photo
    await element(by.text('New')).tap();
    await element(by.id('capturePhotoButton')).tap();
    await element(by.text('Select exposure type...')).tap();
    await element(by.text('Asbestos (Class B)')).tap();
    await element(by.id('workActivityInput')).typeText('Asbestos inspection');
    await element(by.text('Save Exposure')).tap();
    await element(by.text('OK')).tap();

    // Verify photo pending
    await element(by.text('History')).tap();
    await detoxExpect(element(by.text('📸 1 photo (pending)'))).toBeVisible();

    // Simulate intermittent connectivity (offline → online → offline)
    await device.setNetworkConditions('wifi');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await device.setNetworkConditions('offline');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Finally go online permanently
    await device.setNetworkConditions('wifi');

    // Wait for retry to succeed
    await waitFor(element(by.text('📸 1 photo')))
      .toBeVisible()
      .withTimeout(20000); // Longer timeout for retry logic

    await detoxExpect(element(by.text('(pending)'))).not.toBeVisible();
  });
});
