import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log('Web Vital:', metric.name, metric.value);
  
  // Example: Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }

  // Note: Removed API call to /api/web-vitals since we don't have a backend endpoint
  // If you want to collect web vitals data, you can:
  // 1. Set up Google Analytics 4
  // 2. Use Vercel Analytics
  // 3. Create a serverless function for /api/web-vitals
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
} 