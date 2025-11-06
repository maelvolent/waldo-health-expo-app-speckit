/**
 * T103: HazardScanResult Component Tests
 * Tests for AI hazard detection result display and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HazardScanResult } from '../HazardScanResult';

describe('HazardScanResult', () => {
  const mockHazards = [
    {
      type: 'silica_dust',
      confidence: 0.85,
      description: 'Visible dust particles during cutting or grinding',
      boundingBox: null,
    },
    {
      type: 'noise',
      confidence: 0.72,
      description: 'Heavy machinery operating in background',
      boundingBox: null,
    },
  ];

  const mockSuggestedPPE = ['P2_RESPIRATOR', 'SAFETY_GLASSES', 'EAR_PROTECTION'];

  describe('Hazard Display', () => {
    it('should render detected hazards with confidence levels', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          processingTime={2500}
        />
      );

      expect(screen.getByText(/Visible dust particles/i)).toBeTruthy();
      expect(screen.getByText(/Heavy machinery operating/i)).toBeTruthy();
      expect(screen.getByText(/85% confident/i)).toBeTruthy();
      expect(screen.getByText(/72% confident/i)).toBeTruthy();
    });

    it('should filter out low-confidence hazards', () => {
      const lowConfidenceHazards = [
        ...mockHazards,
        {
          type: 'unknown',
          confidence: 0.3, // Below minimum threshold
          description: 'Uncertain detection',
          boundingBox: null,
        },
      ];

      render(
        <HazardScanResult
          detectedHazards={lowConfidenceHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
        />
      );

      expect(screen.queryByText(/Uncertain detection/i)).toBeNull();
    });

    it('should show high confidence badge for 80%+ detections', () => {
      const highConfidenceHazards = [
        {
          type: 'asbestos_class_a',
          confidence: 0.92,
          description: 'Fibrous material matching asbestos characteristics',
          boundingBox: null,
        },
      ];

      render(
        <HazardScanResult
          detectedHazards={highConfidenceHazards}
          suggestedExposureType="asbestos_class_a"
          suggestedPPE={['P3_RESPIRATOR', 'DISPOSABLE_COVERALLS']}
        />
      );

      expect(screen.getByText(/High Confidence/i)).toBeTruthy();
    });
  });

  describe('No Hazards Detected', () => {
    it('should show no hazards message when no detections meet threshold', () => {
      render(
        <HazardScanResult
          detectedHazards={[]}
          suggestedExposureType={null}
          suggestedPPE={[]}
          processingTime={1800}
        />
      );

      expect(screen.getByText(/No Significant Hazards Detected/i)).toBeTruthy();
      expect(screen.getByText(/Analyzed in 1.8s/i)).toBeTruthy();
    });
  });

  describe('Asbestos Disclaimer', () => {
    it('should show asbestos disclaimer when asbestos is detected', () => {
      const asbestosHazards = [
        {
          type: 'asbestos_class_a',
          confidence: 0.88,
          description: 'Suspected asbestos-containing material',
          boundingBox: null,
        },
      ];

      render(
        <HazardScanResult
          detectedHazards={asbestosHazards}
          suggestedExposureType="asbestos_class_a"
          suggestedPPE={['P3_RESPIRATOR']}
        />
      );

      expect(screen.getByText(/Professional Assessment Required/i)).toBeTruthy();
      expect(screen.getByText(/licensed asbestos assessor/i)).toBeTruthy();
      expect(screen.getByText(/Find Licensed Asbestos Assessors/i)).toBeTruthy();
    });

    it('should not show asbestos disclaimer for non-asbestos hazards', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
        />
      );

      expect(screen.queryByText(/Professional Assessment Required/i)).toBeNull();
      expect(screen.queryByText(/licensed asbestos assessor/i)).toBeNull();
    });
  });

  describe('Suggested Exposure Type', () => {
    it('should display suggested exposure type with icon', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
        />
      );

      expect(screen.getByText(/Suggested Exposure Type/i)).toBeTruthy();
      expect(screen.getByText(/Silica Dust/i)).toBeTruthy();
    });
  });

  describe('Recommended PPE', () => {
    it('should display all recommended PPE items', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
        />
      );

      expect(screen.getByText(/Recommended PPE/i)).toBeTruthy();
      expect(screen.getByText(/P2 Respirator/i)).toBeTruthy();
      expect(screen.getByText(/Safety Glasses/i)).toBeTruthy();
      expect(screen.getByText(/Ear Protection/i)).toBeTruthy();
    });
  });

  describe('User Actions', () => {
    it('should call onAccept when Accept button is pressed', () => {
      const mockOnAccept = jest.fn();

      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          onAccept={mockOnAccept}
          onReject={jest.fn()}
          showActions={true}
        />
      );

      const acceptButton = screen.getByText(/Accept Suggestion/i);
      fireEvent.press(acceptButton);

      expect(mockOnAccept).toHaveBeenCalledTimes(1);
    });

    it('should call onReject when Reject button is pressed', () => {
      const mockOnReject = jest.fn();

      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          onAccept={jest.fn()}
          onReject={mockOnReject}
          showActions={true}
        />
      );

      const rejectButton = screen.getByText(/Not Accurate/i);
      fireEvent.press(rejectButton);

      expect(mockOnReject).toHaveBeenCalledTimes(1);
    });

    it('should not show action buttons when showActions is false', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          onAccept={jest.fn()}
          onReject={jest.fn()}
          showActions={false}
        />
      );

      expect(screen.queryByText(/Accept Suggestion/i)).toBeNull();
      expect(screen.queryByText(/Not Accurate/i)).toBeNull();
    });

    it('should show acceptance status when userAccepted is true', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          userAccepted={true}
        />
      );

      expect(screen.getByText(/Accepted by user/i)).toBeTruthy();
    });

    it('should show rejection status when userAccepted is false', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          userAccepted={false}
        />
      );

      expect(screen.getByText(/Rejected by user/i)).toBeTruthy();
    });
  });

  describe('Processing Time', () => {
    it('should display processing time in seconds', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
          processingTime={3250}
        />
      );

      expect(screen.getByText(/Analyzed in 3.3s/i)).toBeTruthy();
    });
  });

  describe('Disclaimer', () => {
    it('should always show AI detection disclaimer', () => {
      render(
        <HazardScanResult
          detectedHazards={mockHazards}
          suggestedExposureType="silica_dust"
          suggestedPPE={mockSuggestedPPE}
        />
      );

      expect(screen.getByText(/AI detection is a suggested starting point/i)).toBeTruthy();
      expect(screen.getByText(/Always verify hazards yourself/i)).toBeTruthy();
    });
  });

  describe('Confidence Color Coding', () => {
    it('should use different colors for different confidence levels', () => {
      const varyingConfidenceHazards = [
        {
          type: 'high_confidence',
          confidence: 0.9, // High (green)
          description: 'High confidence detection',
          boundingBox: null,
        },
        {
          type: 'medium_confidence',
          confidence: 0.7, // Medium (orange)
          description: 'Medium confidence detection',
          boundingBox: null,
        },
        {
          type: 'low_confidence',
          confidence: 0.55, // Low (gray)
          description: 'Low confidence detection',
          boundingBox: null,
        },
      ];

      const { toJSON } = render(
        <HazardScanResult
          detectedHazards={varyingConfidenceHazards}
          suggestedExposureType={null}
          suggestedPPE={[]}
        />
      );

      // Snapshot test to verify different styling
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
