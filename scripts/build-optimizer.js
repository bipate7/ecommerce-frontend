// Build-time optimization utilities (to be used during build process)
class BuildOptimizer {
  static optimizeCSS(css) {
    // Simple CSS minification (in production, use CSSNano)
    return css
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/;\s*/g, ";") // Remove spaces after semicolons
      .replace(/:\s+/g, ":") // Remove spaces after colons
      .replace(/\s*{\s*/g, "{") // Remove spaces around braces
      .replace(/;}/g, "}") // Remove trailing semicolons
      .trim();
  }

  static optimizeHTML(html) {
    // Simple HTML minification
    return html
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/>\s+</g, "><") // Remove spaces between tags
      .trim();
  }

  static async compressImages(images) {
    // This would integrate with a real image compression service
    // For demo purposes, we'll just return the original paths
    console.log("Compressing images:", images);
    return images;
  }

  static generateResponsiveImages(sourceImage, sizes = [400, 800, 1200]) {
    // Generate responsive image URLs for different sizes
    return sizes.map((size) => ({
      width: size,
      url: `${sourceImage}?width=${size}&format=webp`,
    }));
  }
}

// Service Worker for caching and offline functionality
class AssetCacheManager {
  constructor() {
    this.cacheName = "shopeasy-assets-v1";
    this.assetsToCache = [
      "/",
      "/styles/main.css",
      "/styles/optimization.css",
      "/scripts/app.js",
      "/scripts/image-optimizer.js",
      // Add other critical assets
    ];
  }

  async install() {
    const cache = await caches.open(this.cacheName);
    await cache.addAll(this.assetsToCache);
  }

  async fetch(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(request);

      if (response.status === 200) {
        const cache = await caches.open(this.cacheName);
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      // Return offline page or fallback
      return new Response("Network error happened", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }
}

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("SW registered: ", registration);
      })
      .catch(function (registrationError) {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
