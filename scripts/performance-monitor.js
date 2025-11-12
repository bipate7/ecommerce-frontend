// Real-time Performance Monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.monitorNetworkInformation();
    this.setupUserTiming();
  }

  setupPerformanceObserver() {
    // Observe various performance entry types
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.handlePerformanceEntry(entry);
      }
    });

    // Observe different types of performance entries
    observer.observe({
      entryTypes: [
        "navigation",
        "resource",
        "paint",
        "largest-contentful-paint",
        "layout-shift",
        "first-input",
      ],
    });
  }

  handlePerformanceEntry(entry) {
    switch (entry.entryType) {
      case "navigation":
        this.metrics.navigation = entry;
        break;
      case "paint":
        if (entry.name === "first-contentful-paint") {
          this.metrics.fcp = entry.startTime;
        }
        break;
      case "largest-contentful-paint":
        this.metrics.lcp = entry.startTime;
        break;
      case "first-input":
        this.metrics.fid = entry.processingStart - entry.startTime;
        break;
      case "layout-shift":
        if (!entry.hadRecentInput) {
          this.metrics.cls = (this.metrics.cls || 0) + entry.value;
        }
        break;
    }

    this.reportMetrics();
  }

  monitorNetworkInformation() {
    if (navigator.connection) {
      navigator.connection.addEventListener("change", () => {
        this.metrics.connection = {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
        };
        this.reportMetrics();
      });
    }
  }

  setupUserTiming() {
    // Custom user timing marks
    performance.mark("page-loaded");

    window.addEventListener("load", () => {
      performance.mark("load-complete");
      performance.measure("page-load-time", "page-loaded", "load-complete");
    });
  }

  reportMetrics() {
    // Report to analytics or monitoring service
    if (
      this.metrics.fcp &&
      this.metrics.lcp &&
      this.metrics.fid &&
      this.metrics.cls
    ) {
      const coreWebVitals = {
        fcp: this.metrics.fcp,
        lcp: this.metrics.lcp,
        fid: this.metrics.fid,
        cls: this.metrics.cls,
        timestamp: Date.now(),
      };

      // Send to analytics
      this.sendToAnalytics(coreWebVitals);
    }
  }

  sendToAnalytics(data) {
    // Example: Send to Google Analytics
    if (window.gtag) {
      gtag("event", "core_web_vitals", data);
    }

    // Or send to your own analytics endpoint
    fetch("/api/performance-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(console.error);
  }

  getPerformanceScore() {
    // Calculate a simple performance score
    const scores = {
      fcp:
        this.metrics.fcp < 1000
          ? 100
          : Math.max(0, 100 - (this.metrics.fcp - 1000) / 10),
      lcp:
        this.metrics.lcp < 2500
          ? 100
          : Math.max(0, 100 - (this.metrics.lcp - 2500) / 25),
      fid:
        this.metrics.fid < 100
          ? 100
          : Math.max(0, 100 - (this.metrics.fid - 100) / 10),
      cls:
        this.metrics.cls < 0.1
          ? 100
          : Math.max(0, 100 - this.metrics.cls * 1000),
    };

    return (
      Object.values(scores).reduce((a, b) => a + b, 0) /
      Object.values(scores).length
    );
  }
}

// Initialize Performance Monitor
const performanceMonitor = new PerformanceMonitor();
