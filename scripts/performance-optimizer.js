// Performance Optimizer for Website Speed
class PerformanceOptimizer {
  constructor() {
    this.performanceMetrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
    };
    this.init();
  }

  init() {
    this.setupPerformanceMonitoring();
    this.optimizeResourceLoading();
    this.setupIntersectionObservers();
    this.optimizeScrolling();
    this.setupCachingStrategies();
  }

  // Performance Monitoring
  setupPerformanceMonitoring() {
    if ("PerformanceObserver" in window) {
      this.setupPerformanceObservers();
    }

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Log performance metrics
    this.logPerformanceMetrics();
  }

  setupPerformanceObservers() {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.performanceMetrics.fcp = entry.startTime;
        console.log("FCP:", entry.startTime);
      }
    });
    fcpObserver.observe({ entryTypes: ["paint"] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.performanceMetrics.lcp = entry.startTime;
        console.log("LCP:", entry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          this.performanceMetrics.cls += entry.value;
          console.log("CLS:", this.performanceMetrics.cls);
        }
      }
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  }

  monitorCoreWebVitals() {
    // Simulate Core Web Vitals monitoring
    const vitals = {
      getFCP: () => this.performanceMetrics.fcp,
      getLCP: () => this.performanceMetrics.lcp,
      getFID: () => this.performanceMetrics.fid,
      getCLS: () => this.performanceMetrics.cls,
    };

    // Report to analytics
    this.reportPerformanceMetrics(vitals);
  }

  reportPerformanceMetrics(vitals) {
    // Send to your analytics service
    const metrics = {
      fcp: vitals.getFCP(),
      lcp: vitals.getLCP(),
      fid: vitals.getFID(),
      cls: vitals.getCLS(),
      timestamp: Date.now(),
      url: window.location.href,
    };

    // Example: Send to analytics
    if (window.gtag) {
      gtag("event", "performance_metrics", metrics);
    }
  }

  // Resource Loading Optimization
  optimizeResourceLoading() {
    this.deferNonCriticalJS();
    this.optimizeThirdPartyScripts();
    this.preloadCriticalResources();
    this.lazyLoadNonCriticalContent();
  }

  deferNonCriticalJS() {
    // Move non-critical scripts to deferred loading
    const nonCriticalScripts = [
      "chat-widget.js",
      "analytics.js",
      "social-share.js",
    ];

    nonCriticalScripts.forEach((script) => {
      const element = document.querySelector(`script[src*="${script}"]`);
      if (element && !element.defer) {
        element.defer = true;
      }
    });
  }

  optimizeThirdPartyScripts() {
    // Optimize or defer third-party scripts
    const thirdPartyScripts = document.querySelectorAll(
      'script[src*="google-analytics"], script[src*="facebook.net"], script[src*="twitter.com"]'
    );

    thirdPartyScripts.forEach((script) => {
      if (!script.async) {
        script.async = true;
      }
    });
  }

  preloadCriticalResources() {
    // Preload critical resources
    const criticalResources = [
      { href: "/styles/critical.css", as: "style" },
      { href: "/scripts/critical.js", as: "script" },
      { href: "/images/hero-image.jpg", as: "image" },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });
  }

  lazyLoadNonCriticalContent() {
    // Lazy load images, videos, and iframes
    const lazyMedia = document.querySelectorAll(
      "img[data-src], iframe[data-src], video[data-src]"
    );

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.src = element.dataset.src;
            element.removeAttribute("data-src");
            lazyObserver.unobserve(element);
          }
        });
      },
      { rootMargin: "50px 0px" }
    );

    lazyMedia.forEach((media) => lazyObserver.observe(media));
  }

  // Intersection Observers for Performance
  setupIntersectionObservers() {
    this.observeContentVisibility();
    this.observeLazyComponents();
  }

  observeContentVisibility() {
    // Use Content Visibility API for off-screen content
    const sections = document.querySelectorAll(
      "section, .product-grid, .related-products"
    );

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.contentVisibility = "visible";
        } else {
          entry.target.style.contentVisibility = "auto";
        }
      });
    });

    sections.forEach((section) => {
      section.style.contentVisibility = "auto";
      visibilityObserver.observe(section);
    });
  }

  observeLazyComponents() {
    // Lazy load components that are not critical
    const lazyComponents = document.querySelectorAll(
      ".testimonials, .newsletter, .social-feeds"
    );

    const componentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadComponent(entry.target);
          componentObserver.unobserve(entry.target);
        }
      });
    });

    lazyComponents.forEach((component) => componentObserver.observe(component));
  }

  loadComponent(element) {
    // Load component content dynamically
    const componentType = element.className;

    switch (componentType) {
      case "testimonials":
        this.loadTestimonials(element);
        break;
      case "newsletter":
        this.loadNewsletter(element);
        break;
      case "social-feeds":
        this.loadSocialFeeds(element);
        break;
    }
  }

  // Scrolling Performance
  optimizeScrolling() {
    this.debounceScrollEvents();
    this.optimizeScrollAnimations();
  }

  debounceScrollEvents() {
    let ticking = false;

    const updateOnScroll = () => {
      // Perform scroll-based updates
      this.handleScrollEffects();
      ticking = false;
    };

    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  handleScrollEffects() {
    // Optimized scroll effects
    const scrollY = window.scrollY;
    const header = document.querySelector(".header");

    if (header) {
      if (scrollY > 100) {
        header.style.background = "rgba(255, 255, 255, 0.95)";
        header.style.backdropFilter = "blur(10px)";
      } else {
        header.style.background = "#fff";
        header.style.backdropFilter = "none";
      }
    }
  }

  optimizeScrollAnimations() {
    // Use transform for better performance
    const animatedElements = document.querySelectorAll(
      ".product-card, .preview-item"
    );

    animatedElements.forEach((element) => {
      element.style.willChange = "transform";
    });
  }

  // Caching Strategies
  setupCachingStrategies() {
    this.setupServiceWorker();
    this.optimizeAPICaching();
    this.setupMemoryCaching();
  }

  setupServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }
  }

  optimizeAPICaching() {
    // Extend API service with better caching
    if (window.apiService) {
      const originalFetch = window.apiService.fetchProducts;

      window.apiService.fetchProducts = async function (limit = 20) {
        const cacheKey = `products_v2_${limit}`;

        // Check memory cache first
        if (this.isCacheValid(cacheKey)) {
          return this.cache.get(cacheKey).data;
        }

        // Then check session storage
        const sessionCache = sessionStorage.getItem(cacheKey);
        if (sessionCache) {
          const cachedData = JSON.parse(sessionCache);
          if (Date.now() - cachedData.timestamp < 300000) {
            // 5 minutes
            return cachedData.data;
          }
        }

        // Fetch from API
        try {
          const products = await originalFetch.call(this, limit);

          // Cache in memory
          this.cache.set(cacheKey, {
            data: products,
            timestamp: Date.now(),
          });

          // Cache in session storage
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: products,
              timestamp: Date.now(),
            })
          );

          return products;
        } catch (error) {
          console.error("API fetch failed:", error);
          throw error;
        }
      };
    }
  }

  setupMemoryCaching() {
    // Simple memory cache for frequently accessed data
    this.memoryCache = new Map();

    // Cache DOM elements
    this.cacheDOMElements();
  }

  cacheDOMElements() {
    this.cachedElements = {
      header: document.querySelector(".header"),
      productGrid: document.querySelector(".product-grid"),
      cartBadge: document.querySelector(".cart-badge"),
    };
  }

  // Utility Methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Performance Logging
  logPerformanceMetrics() {
    window.addEventListener("load", () => {
      const navigationTiming = performance.getEntriesByType("navigation")[0];
      const loadTime =
        navigationTiming.loadEventEnd - navigationTiming.navigationStart;

      console.log("Page Load Time:", loadTime);
      console.log("Performance Metrics:", this.performanceMetrics);
    });
  }

  // Get performance report
  getPerformanceReport() {
    return {
      metrics: this.performanceMetrics,
      userAgent: navigator.userAgent,
      connection: navigator.connection
        ? navigator.connection.effectiveType
        : "unknown",
      timestamp: Date.now(),
    };
  }
}

// Initialize Performance Optimizer
let performanceOptimizer;

document.addEventListener("DOMContentLoaded", function () {
  performanceOptimizer = new PerformanceOptimizer();
});

// Export for global access
window.PerformanceOptimizer = PerformanceOptimizer;
