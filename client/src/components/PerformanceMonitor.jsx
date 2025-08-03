import { useEffect, useRef } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const PerformanceMonitor = () => {
  const hasReported = useRef(false);

  useEffect(() => {
    // Only report once per session to reduce overhead
    if (hasReported.current) return;

    const reportMetric = (metric) => {
      // Only log in development or if explicitly enabled
      if (process.env.NODE_ENV === 'development') {
        console.log(`Web Vital - ${metric.name}:`, metric.value);
      }

      // Send to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        });
      }

      // Send to backend in production
      if (process.env.NODE_ENV === 'production') {
        // Use requestIdleCallback for non-critical reporting
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            fetch('/api/web-vitals', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(metric),
            }).catch(() => {
              // Silently fail to avoid performance impact
            });
          });
        }
      }
    };

    // Initialize web vitals monitoring
    getCLS(reportMetric);
    getFID(reportMetric);
    getFCP(reportMetric);
    getLCP(reportMetric);
    getTTFB(reportMetric);

    // Monitor memory usage only in development
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memory = performance.memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });
      };

      // Log memory usage every 30 seconds in development
      const memoryInterval = setInterval(logMemoryUsage, 30000);

      return () => clearInterval(memoryInterval);
    }

    hasReported.current = true;
  }, []);

  return null;
};

export default PerformanceMonitor; 