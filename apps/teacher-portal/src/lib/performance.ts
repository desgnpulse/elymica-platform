/**
 * Performance Monitoring Utilities
 *
 * Lightweight utilities for tracking performance metrics in production.
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Report Web Vitals to analytics endpoint
 *
 * Usage:
 * ```tsx
 * // app/layout.tsx
 * import { reportWebVitals } from '@/lib/performance';
 *
 * export function reportWebVitals(metric) {
 *   console.log(metric);
 *   // Send to analytics service
 * }
 * ```
 */
export function reportWebVitals(metric: PerformanceMetrics): void {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToAnalytics(metric);
    console.log('[Performance]', metric);
  } else {
    // In development, log to console
    console.log('[Performance]', metric);
  }
}

/**
 * Measure component render time
 *
 * Usage:
 * ```tsx
 * const renderTimer = measureRender('TeacherDashboard');
 * // ... component renders ...
 * renderTimer.end();
 * ```
 */
export function measureRender(componentName: string) {
  const startTime = performance.now();

  return {
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }

      return renderTime;
    },
  };
}

/**
 * Debounce function to reduce excessive re-renders
 *
 * Usage:
 * ```tsx
 * const debouncedSearch = debounce((query: string) => {
 *   // Expensive search operation
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 *
 * Usage:
 * ```tsx
 * const throttledScroll = throttle(() => {
 *   // Handle scroll
 * }, 100);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if code is running on client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (!isClient) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get network information (if available)
 */
export function getNetworkInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} {
  if (!isClient || !('connection' in navigator)) {
    return {};
  }

  const connection = (navigator as any).connection;

  return {
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData,
  };
}

/**
 * Lazy load images with Intersection Observer
 *
 * Usage:
 * ```tsx
 * <img
 *   data-src="image.jpg"
 *   ref={(el) => el && lazyLoadImage(el)}
 *   alt="Description"
 * />
 * ```
 */
export function lazyLoadImage(img: HTMLImageElement): void {
  if (!isClient || !('IntersectionObserver' in window)) {
    // Fallback for older browsers
    const src = img.getAttribute('data-src');
    if (src) img.src = src;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  observer.observe(img);
}
