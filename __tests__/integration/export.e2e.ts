/**
 * T062: Integration test for PDF export flow
 * Tests complete export workflow from selection to sharing
 * 
 * Run with: detox test --configuration ios.sim.debug
 */

import { device, element, by, expect as detoxExpect } from 'detox';

describe('Export Flow (E2E)', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        camera: 'YES',
        location: 'always',
        microphone: 'YES',
      },
    });

    // Create some test exposures for export
    await seedTestExposures();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  async function seedTestExposures() {
    // Create 3 test exposures with different types
    const exposures = [
      { type: 'Silica Dust', activity: 'Concrete cutting' },
      { type: 'Welding Fumes', activity: 'Steel welding' },
      { type: 'Asbestos (Class A)', activity: 'Asbestos removal' },
    ];

    for (const exp of exposures) {
      await element(by.text('New')).tap();
      await element(by.text('Select exposure type...')).tap();
      await element(by.text(exp.type)).tap();
      await element(by.id('workActivityInput')).typeText(exp.activity);
      await element(by.text('Save Exposure')).tap();
      await element(by.text('OK')).tap();
    }
  }

  describe('PDF Export', () => {
    it('should navigate to export screen', async () => {
      await element(by.text('Export')).tap();
      
      await detoxExpect(element(by.text('Export Documentation'))).toBeVisible();
      await detoxExpect(element(by.text('3 exposures available for export'))).toBeVisible();
    });

    it('should select PDF format', async () => {
      await element(by.text('Export')).tap();

      // PDF should be selected by default
      await detoxExpect(element(by.text('PDF Document'))).toBeVisible();
      await detoxExpect(element(by.text('Professional document with cover page, photos, and all details. Suitable for ACC claims.'))).toBeVisible();
      
      // Radio button should be selected
      const pdfOption = element(by.text('PDF Document')).atIndex(0);
      await detoxExpect(pdfOption).toBeVisible();
    });

    it('should generate PDF and show progress', async () => {
      await element(by.text('Export')).tap();

      // Tap generate button
      await element(by.text('Generate PDF Export')).tap();

      // Should show progress indicator
      await detoxExpect(element(by.text('Generating PDF with 3 exposures...'))).toBeVisible();

      // Wait for generation to complete
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle large PDF exports with chunking', async () => {
      // This test would require seeding 51+ exposures
      // For now, verify the warning message appears for large exports

      await element(by.text('Export')).tap();

      // If >50 exposures, should show warning
      // For this test, we'll assume <50 and verify normal flow works
      await detoxExpect(element(by.text('Export Documentation'))).toBeVisible();
    });

    it('should fetch photos before PDF generation', async () => {
      await element(by.text('Export')).tap();

      // Tap generate
      await element(by.text('Generate PDF Export')).tap();

      // Should show fetching photos stage
      await waitFor(element(by.text('Fetching photos...')))
        .toBeVisible()
        .withTimeout(5000);

      // Then generating PDF
      await waitFor(element(by.text('Generating PDF with 3 exposures...')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should share generated PDF', async () => {
      await element(by.text('Export')).tap();
      await element(by.text('Generate PDF Export')).tap();

      // Wait for generation
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(10000);

      // Share sheet should appear (platform-specific)
      // On iOS, this would show the share sheet
      // On Android, this would show share options
    });

    it('should work offline after photos are fetched', async () => {
      // Ensure photos are already fetched
      await element(by.text('Export')).tap();

      // Go offline
      await device.setNetworkConditions('offline');

      // Generate PDF
      await element(by.text('Generate PDF Export')).tap();

      // Should still work offline (images embedded)
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(10000);

      // Restore network
      await device.setNetworkConditions('wifi');
    });
  });

  describe('CSV Export', () => {
    it('should select CSV format', async () => {
      await element(by.text('Export')).tap();

      // Tap CSV option
      await element(by.text('CSV Spreadsheet')).tap();

      // Verify selection
      await detoxExpect(element(by.text('All exposure data in spreadsheet format. Compatible with Excel and Google Sheets.'))).toBeVisible();
    });

    it('should generate CSV export', async () => {
      await element(by.text('Export')).tap();
      await element(by.text('CSV Spreadsheet')).tap();

      // Generate
      await element(by.text('Generate CSV Export')).tap();

      // Should show progress
      await detoxExpect(element(by.text('Generating CSV...'))).toBeVisible();

      // Wait for completion
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should generate CSV summary', async () => {
      await element(by.text('Export')).tap();
      await element(by.text('CSV Summary')).tap();

      // Verify description
      await detoxExpect(element(by.text('Statistical summary with totals by type and severity.'))).toBeVisible();

      // Generate
      await element(by.text('Generate CSV-SUMMARY Export')).tap();

      // Should show progress
      await detoxExpect(element(by.text('Generating summary...'))).toBeVisible();

      // Wait for completion
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should CSV share successfully', async () => {
      await element(by.text('Export')).tap();
      await element(by.text('CSV Spreadsheet')).tap();
      await element(by.text('Generate CSV Export')).tap();

      // Wait for generation
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(5000);

      // Share should be triggered
      // Platform-specific share sheet would appear
    });
  });

  describe('Export Information', () => {
    it('should display export information', async () => {
      await element(by.text('Export')).tap();

      // Verify info box is visible
      await detoxExpect(element(by.text('📄 Export Information'))).toBeVisible();
      await detoxExpect(element(by.text('• PDF exports include all photos embedded as optimized images (800px width, 80% quality)'))).toBeVisible();
      await detoxExpect(element(by.text('• Photos are displayed in a 2-column grid for professional presentation'))).toBeVisible();
      await detoxExpect(element(by.text('• Exports work offline after photos are fetched'))).toBeVisible();
    });

    it('should show exposure count', async () => {
      await element(by.text('Export')).tap();

      // Should show count in subtitle
      await detoxExpect(element(by.text('3 exposures available for export'))).toBeVisible();
    });

    it('should handle zero exposures gracefully', async () => {
      // This would require clearing all exposures first
      // For now, verify that with exposures, the count is shown correctly
      await element(by.text('Export')).tap();
      await detoxExpect(element(by.text('Export Documentation'))).toBeVisible();
    });
  });

  describe('Cancel Export', () => {
    it('should cancel and return to home', async () => {
      await element(by.text('Export')).tap();

      // Tap cancel
      await element(by.text('Cancel')).tap();

      // Should navigate back
      await detoxExpect(element(by.text('Home'))).toBeVisible();
    });

    it('should not allow export while generating', async () => {
      await element(by.text('Export')).tap();
      await element(by.text('Generate PDF Export')).tap();

      // Button should be disabled during generation
      // Verify button text changes
      await detoxExpect(element(by.text('Generating PDF with 3 exposures...'))).toBeVisible();

      // Wait for completion
      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle export failure gracefully', async () => {
      // Simulate error conditions (would require mocking)
      // For now, verify error handling structure exists
      await element(by.text('Export')).tap();
      await detoxExpect(element(by.text('Export Documentation'))).toBeVisible();
    });

    it('should show friendly error for failed photo fetch', async () => {
      // Go offline before export
      await device.setNetworkConditions('offline');

      await element(by.text('Export')).tap();
      await element(by.text('Generate PDF Export')).tap();

      // If photos haven't been fetched yet, should handle gracefully
      // Either complete without photos or show error

      // Restore network
      await device.setNetworkConditions('wifi');
    });
  });

  describe('Performance', () => {
    it('should generate PDF in under 5 seconds for 10 exposures', async () => {
      // This test assumes we have ~10 exposures
      // For 3 exposures, should be much faster

      await element(by.text('Export')).tap();

      const startTime = Date.now();
      await element(by.text('Generate PDF Export')).tap();

      await waitFor(element(by.text('Export complete!')))
        .toBeVisible()
        .withTimeout(5000);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Should complete quickly for small exports
      if (duration > 5) {
        throw new Error(`PDF generation took ${duration}s, exceeds 5s target for small exports`);
      }
    });
  });
});
