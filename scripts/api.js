// API Service for Product Data
class ProductAPIService {
  constructor() {
    this.baseURL = "https://fakestoreapi.com";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  async fetchProducts(limit = 20, forceRefresh = false) {
    const cacheKey = `products_${limit}`;

    // Check cache first
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      console.log("Returning cached products");
      return this.cache.get(cacheKey).data;
    }

    try {
      this.showGlobalLoading();

      const response = await fetch(`${this.baseURL}/products?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();

      // Enhance product data with additional properties
      const enhancedProducts = this.enhanceProductData(products);

      // Cache the results
      this.cache.set(cacheKey, {
        data: enhancedProducts,
        timestamp: Date.now(),
      });

      this.hideGlobalLoading();
      return enhancedProducts;
    } catch (error) {
      this.hideGlobalLoading();
      console.error("API Error:", error);

      // Return cached data as fallback if available
      if (this.cache.has(cacheKey)) {
        console.log("Using cached data as fallback");
        return this.cache.get(cacheKey).data;
      }

      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async fetchProductById(id) {
    const cacheKey = `product_${id}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await fetch(`${this.baseURL}/products/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const product = await response.json();
      const enhancedProduct = this.enhanceProductData([product])[0];

      this.cache.set(cacheKey, {
        data: enhancedProduct,
        timestamp: Date.now(),
      });

      return enhancedProduct;
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch product ${id}: ${error.message}`);
    }
  }

  async fetchProductsByCategory(category) {
    const cacheKey = `products_category_${category}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      this.showGlobalLoading();

      const response = await fetch(
        `${this.baseURL}/products/category/${category}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      const enhancedProducts = this.enhanceProductData(products);

      this.cache.set(cacheKey, {
        data: enhancedProducts,
        timestamp: Date.now(),
      });

      this.hideGlobalLoading();
      return enhancedProducts;
    } catch (error) {
      this.hideGlobalLoading();
      console.error("API Error:", error);

      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      throw new Error(
        `Failed to fetch products for category ${category}: ${error.message}`
      );
    }
  }

  async fetchCategories() {
    const cacheKey = "categories";

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await fetch(`${this.baseURL}/products/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories = await response.json();

      this.cache.set(cacheKey, {
        data: categories,
        timestamp: Date.now(),
      });

      return categories;
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  enhanceProductData(products) {
    return products.map((product) => ({
      ...product,
      discount: this.generateRandomDiscount(),
      badge: this.generateRandomBadge(),
      currentPrice: this.calculateCurrentPrice(product.price),
      rating: {
        rate: product.rating?.rate || 0,
        count: product.rating?.count || 0,
      },
      stock: Math.floor(Math.random() * 100) + 1, // Random stock
      isFeatured: Math.random() > 0.7, // Random featured status
    }));
  }

  generateRandomDiscount() {
    const shouldHaveDiscount = Math.random() > 0.6; // 40% chance
    return shouldHaveDiscount ? Math.floor(Math.random() * 50) + 10 : 0;
  }

  generateRandomBadge() {
    const badges = [
      { type: "sale", probability: 0.2 },
      { type: "new", probability: 0.15 },
      { type: "popular", probability: 0.1 },
      { type: "", probability: 0.55 },
    ];

    let random = Math.random();
    let cumulativeProbability = 0;

    for (const badge of badges) {
      cumulativeProbability += badge.probability;
      if (random <= cumulativeProbability) {
        return badge.type;
      }
    }

    return "";
  }

  calculateCurrentPrice(
    originalPrice,
    discount = this.generateRandomDiscount()
  ) {
    return discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
  }

  isCacheValid(cacheKey) {
    if (!this.cache.has(cacheKey)) return false;

    const cachedItem = this.cache.get(cacheKey);
    return Date.now() - cachedItem.timestamp < this.cacheTimeout;
  }

  clearCache() {
    this.cache.clear();
    console.log("Cache cleared");
  }

  showGlobalLoading() {
    // Create global loading indicator if it doesn't exist
    let loader = document.getElementById("global-loader");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "global-loader";
      loader.className = "global-loader";
      loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p>Loading products...</p>
                </div>
            `;
      document.body.appendChild(loader);
    }
    loader.style.display = "flex";
  }

  hideGlobalLoading() {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.style.display = "none";
    }
  }

  // Method to simulate slow network for testing
  async simulateSlowNetwork(delay = 2000) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// API Error Handler
class APIErrorHandler {
  static handleError(error, userFriendlyMessage = "Something went wrong") {
    console.error("API Error:", error);

    // Show user-friendly error message
    this.showErrorToast(userFriendlyMessage);

    // You can also send errors to monitoring service here
    this.logErrorToService(error);

    return {
      success: false,
      error: error.message,
      userMessage: userFriendlyMessage,
    };
  }

  static showErrorToast(message) {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);

    // Close button handler
    toast.querySelector(".toast-close").addEventListener("click", () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }

  static logErrorToService(error) {
    // In a real application, you would send this to your error monitoring service
    // like Sentry, LogRocket, etc.
    console.log("Error logged to monitoring service:", error);
  }
}

// Initialize API Service
const apiService = new ProductAPIService();
