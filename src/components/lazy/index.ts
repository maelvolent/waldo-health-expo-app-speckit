/**
 * T118: Lazy-Loaded Component Exports
 *
 * Heavy components that are loaded on-demand to reduce initial bundle size
 */

import { createLazyComponent, MapLoadingFallback, CameraLoadingFallback } from '@utils/lazyLoad';

/**
 * Lazy-loaded MapView component
 * Only loaded when user navigates to map tab
 */
export const LazyMapView = createLazyComponent(
  () => import('@components/exposure/MapView').then(module => ({ default: module.MapView })),
  {
    fallback: <MapLoadingFallback />,
    preload: false, // Don't preload - load on demand
  }
);

/**
 * Lazy-loaded PhotoCapture component
 * Only loaded when user starts creating a new exposure
 */
export const LazyPhotoCapture = createLazyComponent(
  () => import('@components/exposure/PhotoCapture').then(module => ({ default: module.PhotoCapture })),
  {
    fallback: <CameraLoadingFallback />,
    preload: false,
  }
);

/**
 * Lazy-loaded HazardScanResult component
 * Only loaded when AI scan is requested
 */
export const LazyHazardScanResult = createLazyComponent(
  () => import('@components/exposure/HazardScanResult').then(module => ({ default: module.HazardScanResult })),
  {
    preload: false,
  }
);

/**
 * Preload functions for anticipatory loading
 */
export const preloadMapView = () => import('@components/exposure/MapView');
export const preloadPhotoCapture = () => import('@components/exposure/PhotoCapture');
export const preloadHazardScanResult = () => import('@components/exposure/HazardScanResult');
