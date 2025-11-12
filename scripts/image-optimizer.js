// Enhanced Image Optimization and Lazy Loading Manager
class ImageOptimizer {
  constructor() {
    this.observedImages = new Set();
    this.imageCache = new Map();
    this.supportsWebP = this.checkWebPSupport();
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.optimizeExistingImages();
    this.preloadCriticalImages();
    this.setupResponsiveImages();
  }

  // Enhanced WebP support detection
  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = function () {
        resolve(webP.height === 2);
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  }

  // Enhanced WebP conversion with fallback
  async getOptimizedImageUrl(originalUrl, width = null, quality = 80) {
    // Skip data URIs and already optimized images
    if (
      originalUrl.startsWith("data:") ||
      originalUrl.includes("placeholder.com")
    ) {
      return originalUrl;
    }

    // Check cache first
    const cacheKey = `${originalUrl}-${width}-${quality}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey);
    }

    const supportsWebP = await this.supportsWebP;

    if (
      supportsWebP &&
      !originalUrl.includes(".svg") &&
      !originalUrl.includes(".gif")
    ) {
      try {
        const optimizedUrl = this.convertToWebP(originalUrl, width, quality);
        this.imageCache.set(cacheKey, optimizedUrl);
        return optimizedUrl;
      } catch (error) {
        console.warn("WebP conversion failed, using original:", originalUrl);
      }
    }

    // Fallback to original with width optimization
    const optimizedUrl = width
      ? this.addWidthParam(originalUrl, width)
      : originalUrl;
    this.imageCache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  convertToWebP(url, width, quality) {
    // For production, integrate with a real image CDN like Cloudinary, Imgix, or your own service
    const urlObj = new URL(url, window.location.origin);

    // Remove existing format parameters
    urlObj.searchParams.delete("format");
    urlObj.searchParams.delete("fm");

    // Add WebP optimization parameters
    urlObj.searchParams.set("fm", "webp");
    urlObj.searchParams.set("q", quality.toString());

    if (width) {
      urlObj.searchParams.set("w", width.toString());
    }

    return urlObj.toString();
  }

  addWidthParam(url, width) {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set("w", width.toString());
    return urlObj.toString();
  }

  // Enhanced lazy loading with better performance
  setupLazyLoading() {
    if (!("IntersectionObserver" in window)) {
      this.lazyLoadFallback();
      return;
    }

    this.lazyLoadObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadLazyImage(img);
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "100px 0px", // Load images 100px before they enter viewport
        threshold: 0.01,
      }
    );

    // Observe all lazy images
    document.querySelectorAll("img[data-src]").forEach((img) => {
      this.lazyLoadObserver.observe(img);
    });
  }

  async loadLazyImage(img) {
    const src = img.getAttribute("data-src");
    const srcset = img.getAttribute("data-srcset");

    if (!src) return;

    try {
      // Get optimized URL
      const optimizedSrc = await this.getOptimizedImageUrl(
        src,
        img.dataset.width || 800,
        85
      );

      // Create new image for preloading
      const preloadImg = new Image();

      preloadImg.onload = () => {
        // Set the actual image source after preload
        img.src = optimizedSrc;
        if (srcset) {
          img.srcset = srcset;
        }

        img.classList.add("lazy-loaded", "loaded");
        img.removeAttribute("data-src");
        img.removeAttribute("data-srcset");

        // Remove placeholder
        const placeholder = img.nextElementSibling;
        if (
          placeholder &&
          placeholder.classList.contains("image-placeholder")
        ) {
          placeholder.style.display = "none";
        }
      };

      preloadImg.onerror = () => {
        this.handleImageError(img);
      };

      preloadImg.src = optimizedSrc;
    } catch (error) {
      console.error("Error loading lazy image:", error);
      this.handleImageError(img);
    }
  }

  // Enhanced responsive images setup
  setupResponsiveImages() {
    const productImages = document.querySelectorAll(
      ".product-image img, .product-images img"
    );

    productImages.forEach(async (img) => {
      await this.makeImageResponsive(img);
    });
  }

  async makeImageResponsive(img) {
    const originalSrc = img.src || img.getAttribute("data-src");
    if (!originalSrc) return;

    // Define responsive breakpoints
    const breakpoints = [
      { width: 400, media: "(max-width: 480px)" },
      { width: 600, media: "(max-width: 768px)" },
      { width: 800, media: "(max-width: 1200px)" },
      { width: 1200, media: "(min-width: 1201px)" },
    ];

    // Generate srcset with optimized URLs
    const srcsetPromises = breakpoints.map(async (bp) => {
      const optimizedUrl = await this.getOptimizedImageUrl(
        originalSrc,
        bp.width,
        85
      );
      return `${optimizedUrl} ${bp.width}w`;
    });

    const srcset = (await Promise.all(srcsetPromises)).join(", ");

    // Set responsive attributes
    const sizes = breakpoints
      .map((bp) => `${bp.media} ${bp.width}px`)
      .join(", ");

    if (img.hasAttribute("data-src")) {
      img.setAttribute("data-srcset", srcset);
    } else {
      img.setAttribute("srcset", srcset);
    }

    img.setAttribute("sizes", sizes);
    img.setAttribute("loading", "lazy");
  }

  // Optimize all existing images on page
  async optimizeExistingImages() {
    const images = document.querySelectorAll("img:not([data-no-optimize])");

    for (const img of images) {
      await this.optimizeSingleImage(img);
    }
  }

  async optimizeSingleImage(img) {
    if (img.getAttribute("data-optimized") || img.src.includes(".svg")) {
      return;
    }

    const originalSrc = img.src;

    if (
      originalSrc.startsWith("data:") ||
      originalSrc.includes("placeholder.com")
    ) {
      return;
    }

    try {
      const optimizedSrc = await this.getOptimizedImageUrl(
        originalSrc,
        null,
        85
      );

      if (img.src !== optimizedSrc) {
        img.src = optimizedSrc;
      }

      img.setAttribute("data-optimized", "true");
    } catch (error) {
      console.warn("Image optimization failed:", error);
    }
  }

  // Enhanced error handling
  handleImageError(img) {
    console.warn(
      "Image failed to load:",
      img.src || img.getAttribute("data-src")
    );

    // Set a better placeholder
    const placeholder = this.generateSVGPlaceholder(
      img.offsetWidth || 300,
      img.offsetHeight || 300
    );
    img.src = placeholder;
    img.classList.add("load-error", "placeholder");

    // Remove from observer if it's being observed
    if (this.lazyLoadObserver && img.hasAttribute("data-src")) {
      this.lazyLoadObserver.unobserve(img);
    }
  }

  generateSVGPlaceholder(width, height) {
    const text = "Image not available";
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="#666" opacity="0.7">
          ${text}
        </text>
      </svg>
    `)}`;
  }

  // Preload critical above-the-fold images
  preloadCriticalImages() {
    const criticalImages = [
      // Add paths to your critical images
      // '/assets/hero-background.jpg',
      // '/assets/logo.png'
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
    });
  }

  // Optimize background images
  async optimizeBackgroundImages() {
    const elements = document.querySelectorAll('[style*="background-image"]');

    for (const el of elements) {
      await this.optimizeElementBackground(el);
    }
  }

  async optimizeElementBackground(el) {
    const style = el.getAttribute("style");
    const urlMatch = style.match(/url\(['"]?([^'")]+)['"]?\)/);

    if (urlMatch) {
      const originalUrl = urlMatch[1];
      const optimizedUrl = await this.getOptimizedImageUrl(
        originalUrl,
        null,
        85
      );

      if (optimizedUrl !== originalUrl) {
        const optimizedStyle = style.replace(originalUrl, optimizedUrl);
        el.setAttribute("style", optimizedStyle);
      }
    }
  }

  // Fallback for older browsers
  lazyLoadFallback() {
    let ticking = false;

    const lazyLoad = () => {
      const lazyImages = document.querySelectorAll("img[data-src]");

      lazyImages.forEach((img) => {
        if (this.isInViewport(img)) {
          this.loadLazyImage(img);
        }
      });

      ticking = false;
    };

    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(lazyLoad);
        ticking = true;
      }
    };

    // Initial load
    lazyLoad();

    // Event listeners
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", scrollHandler, { passive: true });
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <=
        (window.innerHeight || document.documentElement.clientHeight) + 100 &&
      rect.bottom >= -100 &&
      rect.left <=
        (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right >= 0
    );
  }

  // Utility function to clear cache
  clearCache() {
    this.imageCache.clear();
    console.log("Image optimizer cache cleared");
  }

  // Get optimization stats
  getStats() {
    return {
      cachedImages: this.imageCache.size,
      observedImages: this.observedImages.size,
    };
  }
}

// Enhanced initialization with error handling
let imageOptimizer;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    imageOptimizer = new ImageOptimizer();
    console.log("Image Optimizer initialized successfully");
  } catch (error) {
    console.error("Image Optimizer failed to initialize:", error);
  }
});

// Make available globally for other scripts
window.ImageOptimizer = ImageOptimizer;
