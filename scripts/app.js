// API Service for Product Data
class ProductAPIService {
  constructor() {
    this.baseURL = "https://fakestoreapi.com";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.exchangeRate = 83; // USD to INR exchange rate (approximate)
  }

  async fetchProducts(limit = 20) {
    const cacheKey = `products_${limit}`;

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log("Returning cached products");
      return this.cache.get(cacheKey).data;
    }

    try {
      console.log("Fetching products from API...");
      const response = await fetch(`${this.baseURL}/products?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      console.log("Raw products from API:", products);

      // Enhance product data with additional properties and convert to INR
      const enhancedProducts = this.enhanceProductData(products);
      console.log("Enhanced products:", enhancedProducts);

      // Cache the results
      this.cache.set(cacheKey, {
        data: enhancedProducts,
        timestamp: Date.now(),
      });

      return enhancedProducts;
    } catch (error) {
      console.error("API Error:", error);

      // Return cached data as fallback if available
      if (this.cache.has(cacheKey)) {
        console.log("Using cached data as fallback");
        return this.cache.get(cacheKey).data;
      }

      // Return mock data if API fails and no cache
      console.log("Using mock data as fallback");
      return this.getMockProducts();
    }
  }

  async fetchProductById(id) {
    try {
      const response = await fetch(`${this.baseURL}/products/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const product = await response.json();
      // Convert price to INR and enhance data
      return this.enhanceProductData([product])[0];
    } catch (error) {
      console.error("API Error fetching product:", error);
      // Return mock product if API fails
      return this.getMockProducts().find((p) => p.id === parseInt(id)) || null;
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${this.baseURL}/products/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories = await response.json();
      return categories;
    } catch (error) {
      console.error("API Error fetching categories:", error);
      // Return default categories if API fails
      return ["electronics", "jewelery", "men's clothing", "women's clothing"];
    }
  }

  async fetchProductsByCategory(category) {
    try {
      const response = await fetch(
        `${this.baseURL}/products/category/${category}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      return this.enhanceProductData(products);
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(
        `Failed to fetch products for category ${category}: ${error.message}`
      );
    }
  }

  // Convert USD to INR
  convertToINR(usdPrice) {
    return usdPrice * this.exchangeRate;
  }

  enhanceProductData(products) {
    return products
      .map((product) => ({
        ...product,
        // Convert price from USD to INR
        price: this.convertToINR(product.price),
        discount: Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 10 : 0,
        badge: this.generateRandomBadge(),
        rating: {
          rate: product.rating?.rate || 0,
          count: product.rating?.count || 0,
        },
        stock: Math.floor(Math.random() * 100) + 1,
        isFeatured: Math.random() > 0.7,
      }))
      .map((product) => ({
        ...product,
        // Calculate current price after discount in INR
        currentPrice:
          product.discount > 0
            ? product.price * (1 - product.discount / 100)
            : product.price,
      }));
  }

  generateRandomBadge() {
    const badges = ["sale", "new", "popular", ""];
    const random = Math.random();
    if (random < 0.2) return "sale";
    if (random < 0.35) return "new";
    if (random < 0.45) return "popular";
    return "";
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

  // Mock data as fallback with INR prices
  getMockProducts() {
    return [
      {
        id: 1,
        title: "Classic Modern Watch",
        price: 129.99 * 83, // Converted to INR
        description: "Elegant modern watch with leather strap",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        rating: { rate: 4.5, count: 120 },
      },
      {
        id: 2,
        title: "Premium Wireless Headphones",
        price: 199.99 * 83, // Converted to INR
        description: "Noise cancelling wireless headphones",
        category: "electronics",
        image: "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",
        rating: { rate: 4.3, count: 85 },
      },
      {
        id: 3,
        title: "Cotton T-Shirt",
        price: 29.99 * 83, // Converted to INR
        description: "Comfortable cotton t-shirt for everyday wear",
        category: "men's clothing",
        image:
          "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
        rating: { rate: 4.2, count: 200 },
      },
      {
        id: 4,
        title: "Slim Fit Jeans",
        price: 59.99 * 83, // Converted to INR
        description: "Modern slim fit jeans",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
        rating: { rate: 4.0, count: 150 },
      },
      {
        id: 5,
        title: "Women's Blouse",
        price: 39.99 * 83, // Converted to INR
        description: "Elegant women's blouse for office wear",
        category: "women's clothing",
        image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
        rating: { rate: 4.4, count: 180 },
      },
      {
        id: 6,
        title: "Women's Jacket",
        price: 89.99 * 83, // Converted to INR
        description: "Warm winter jacket for women",
        category: "women's clothing",
        image:
          "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
        rating: { rate: 4.1, count: 95 },
      },
      {
        id: 7,
        title: "Gold Plated Ring",
        price: 149.99 * 83, // Converted to INR
        description: "Beautiful gold plated ring",
        category: "jewelery",
        image:
          "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
        rating: { rate: 4.7, count: 60 },
      },
      {
        id: 8,
        title: "Solid Gold Bracelet",
        price: 299.99 * 83, // Converted to INR
        description: "Luxury solid gold bracelet",
        category: "jewelery",
        image:
          "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
        rating: { rate: 4.9, count: 40 },
      },
    ].map((product) => this.enhanceProductData([product])[0]);
  }
}

// Initialize API Service
const apiService = new ProductAPIService();

// Product Grid Management
class ProductGrid {
  constructor() {
    this.productGrid = document.getElementById("productGrid");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.loadMoreBtn = document.getElementById("loadMoreBtn");
    this.filterBtns = document.querySelectorAll(".filter-btn");
    this.products = [];
    this.filteredProducts = [];
    this.currentLimit = 8;
    this.currentFilter = "all";
    this.isLoading = false;

    // Only initialize if we're on the products page
    if (this.productGrid) {
      this.init();
    }
  }

  init() {
    this.setupEventListeners();
    this.loadProducts();
    this.initializeCategories();
  }

  setupEventListeners() {
    // Filter buttons
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleFilterClick(e.target);
      });
    });

    // Load more button
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener("click", () => {
        this.loadMoreProducts();
      });
    }

    // Search functionality integration
    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Refresh products button
    const refreshBtn = document.createElement("button");
    refreshBtn.className = "refresh-btn";
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    refreshBtn.title = "Refresh Products";
    refreshBtn.addEventListener("click", () => this.refreshProducts());

    const sectionHeader = document.querySelector(".section-header");
    if (sectionHeader) {
      sectionHeader.appendChild(refreshBtn);
    }
  }

  async initializeCategories() {
    try {
      const categories = await apiService.fetchCategories();
      this.updateCategoryFilters(categories);
    } catch (error) {
      console.warn("Could not load categories:", error.message);
    }
  }

  updateCategoryFilters(categories) {
    const filtersContainer = document.querySelector(".product-filters");
    if (!filtersContainer) return;

    // Keep "All Products" button
    const allProductsBtn = filtersContainer.querySelector(
      '[data-filter="all"]'
    );
    filtersContainer.innerHTML = "";
    if (allProductsBtn) {
      filtersContainer.appendChild(allProductsBtn);
    }

    // Add category buttons
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.setAttribute("data-filter", category);
      button.textContent = this.formatCategory(category);
      button.addEventListener("click", (e) => {
        this.handleFilterClick(e.target);
      });
      filtersContainer.appendChild(button);
    });

    // Update filter buttons reference
    this.filterBtns = document.querySelectorAll(".filter-btn");
  }

  async loadProducts() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      console.log("Loading products...");
      this.products = await apiService.fetchProducts(20);
      console.log("Products loaded:", this.products);

      this.filteredProducts = [...this.products];
      this.renderProducts();
    } catch (error) {
      console.error("Error loading products:", error);
      this.showError("Failed to load products. Please check your connection.");
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  async refreshProducts() {
    apiService.clearCache();
    this.currentLimit = 8;
    await this.loadProducts();
    this.showToast("Products refreshed!");
  }

  renderProducts() {
    if (!this.productGrid) {
      console.error("Product grid element not found!");
      return;
    }

    const productsToShow = this.filteredProducts.slice(0, this.currentLimit);
    console.log("Rendering products:", productsToShow);

    if (productsToShow.length === 0) {
      this.showEmptyState();
      return;
    }

    this.productGrid.innerHTML = productsToShow
      .map((product, index) => this.createProductCard(product, index))
      .join("");

    this.loadAllImages();
    this.updateLoadMoreButton();
  }

  createProductCard(product, index) {
    const originalPrice = product.price;
    const currentPrice = product.currentPrice || product.price;
    const discount = product.discount || 0;

    // Use optimized image URL
    const optimizedImage = imageOptimizer
      ? imageOptimizer.getOptimizedImageUrl(product.image, 400, 80)
      : product.image;

    return `
            <div class="product-card" data-category="${
              product.category
            }" data-id="${product.id}">
                ${
                  product.badge
                    ? `<span class="product-badge ${
                        product.badge
                      }">${this.getBadgeText(product.badge)}</span>`
                    : ""
                }
                
                <div class="product-image" onclick="productGrid.viewProductDetail(${
                  product.id
                })" style="cursor: pointer;">
                    img 
                    data-src="${optimizedImage}" 
                    src="${imageOptimizer.generatePlaceholder(300, 300)}"
                    alt="${product.title}"
                    loading="lazy"
                    class="lazy-image"
                    onload="this.classList.add('loaded')"
                    onerror="this.classList.add('load-error')"
                >
                    <div class="image-placeholder"></div>
                </div>
                
                <div class="product-content">
                    <span class="product-category">${this.formatCategory(
                      product.category
                    )}</span>
                    <h3 class="product-title" onclick="productGrid.viewProductDetail(${
                      product.id
                    })" style="cursor: pointer;">${product.title}</h3>
                    <p class="product-description">${this.truncateDescription(
                      product.description
                    )}</p>
                    
                    <div class="product-rating">
                        <div class="rating-stars">
                            ${this.generateStarRating(product.rating.rate)}
                        </div>
                        <span class="rating-count">(${
                          product.rating.count
                        })</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="current-price">${this.formatCurrency(
                          currentPrice
                        )}</span>
                        ${
                          discount > 0
                            ? `
                            <span class="original-price">${this.formatCurrency(
                              originalPrice
                            )}</span>
                            <span class="discount">-${discount}%</span>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="productGrid.addToCart(${
                          product.id
                        })">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="wishlist-btn" onclick="productGrid.toggleWishlist(${
                          product.id
                        })">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  // Add this method to enable product detail navigation
  viewProductDetail(productId) {
    window.location.href = `product.html?id=${productId}`;
  }

  truncateDescription(description, maxLength = 100) {
    if (!description) return "No description available";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  }

  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = "";

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }

    if (halfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return stars;
  }

  getBadgeText(badge) {
    const badgeTexts = {
      sale: "Sale",
      new: "New",
      popular: "Popular",
    };
    return badgeTexts[badge] || "";
  }

  formatCategory(category) {
    return category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  loadAllImages() {
    const images = this.productGrid.querySelectorAll(".product-image img");
    images.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add("loaded");
        const placeholder = img.nextElementSibling;
        if (placeholder) placeholder.style.display = "none";
      }
    });
  }

  handleFilterClick(button) {
    this.filterBtns.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");
    this.currentFilter = filter;
    this.currentLimit = 8;

    if (filter === "all") {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (product) => product.category === filter
      );
    }

    this.renderProducts();
  }

  handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    this.currentLimit = 8;
    this.renderProducts();
  }

  loadMoreProducts() {
    this.currentLimit += 8;
    this.renderProducts();

    setTimeout(() => {
      const lastCard = this.productGrid.lastElementChild;
      if (lastCard) {
        lastCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);
  }

  updateLoadMoreButton() {
    if (!this.loadMoreBtn) return;

    if (this.currentLimit >= this.filteredProducts.length) {
      this.loadMoreBtn.style.display = "none";
    } else {
      this.loadMoreBtn.style.display = "flex";
    }
  }

  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);
    const button = event.target.closest(".add-to-cart-btn");

    if (!button || button.disabled) return;

    // Disable button temporarily to prevent multiple clicks
    button.disabled = true;
    const originalText = button.innerHTML;

    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    button.classList.add("loading");

    // Prepare cart item
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.currentPrice || product.price,
      image: product.image,
      quantity: 1,
      variations: {}, // Empty variations for grid view
      totalPrice: product.currentPrice || product.price,
    };

    // Use the CartManager to add to cart
    if (window.cartManager) {
      const success = window.cartManager.addToCart(cartItem);

      if (success) {
        // Show success state
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.classList.add("added");

        // Reset button after 2 seconds
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = originalText;
          button.classList.remove("added", "loading");
        }, 2000);
      } else {
        // Show error state
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
        button.classList.add("error");

        // Reset button after 2 seconds
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = originalText;
          button.classList.remove("error", "loading");
        }, 2000);
      }
    } else {
      console.error("CartManager not available");
      button.disabled = false;
      button.innerHTML = originalText;
      button.classList.remove("loading");
    }

    console.log("Added to cart:", product.title);

    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
      button.classList.remove("added");
    }, 2000);
  }

  toggleWishlist(productId) {
    const button = event.target.closest(".wishlist-btn");
    if (!button) return;

    const icon = button.querySelector("i");
    button.classList.toggle("active");

    if (button.classList.contains("active")) {
      icon.className = "fas fa-heart";
    } else {
      icon.className = "far fa-heart";
    }
  }

  showLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.add("show");
    }
    if (this.productGrid) {
      this.productGrid.innerHTML = "";
    }
  }

  hideLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.remove("show");
    }
  }

  showEmptyState() {
    if (!this.productGrid) return;

    this.productGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
    if (this.loadMoreBtn) {
      this.loadMoreBtn.style.display = "none";
    }
  }

  showError(message) {
    if (!this.productGrid) return;

    this.productGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Something went wrong</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="productGrid.loadProducts()">
                    Try Again
                </button>
            </div>
        `;
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
}

// Mobile Navigation Toggle
class MobileNavigation {
  constructor() {
    this.hamburger = document.querySelector(".hamburger-menu");
    this.mobileNav = document.querySelector(".mobile-nav");
    this.isOpen = false;

    this.init();
  }

  init() {
    if (this.hamburger) {
      this.hamburger.addEventListener("click", () => this.toggleNavigation());

      // Close mobile nav when clicking on a link
      const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
      mobileNavLinks.forEach((link) => {
        link.addEventListener("click", () => this.closeNavigation());
      });

      // Close mobile nav when clicking outside
      document.addEventListener("click", (e) => {
        if (
          this.isOpen &&
          !this.hamburger.contains(e.target) &&
          !this.mobileNav.contains(e.target)
        ) {
          this.closeNavigation();
        }
      });
    }
  }

  toggleNavigation() {
    if (this.isOpen) {
      this.closeNavigation();
    } else {
      this.openNavigation();
    }
  }

  openNavigation() {
    this.hamburger.classList.add("active");
    this.mobileNav.classList.add("active");
    this.isOpen = true;

    // Add body scroll lock
    document.body.style.overflow = "hidden";
  }

  closeNavigation() {
    this.hamburger.classList.remove("active");
    this.mobileNav.classList.remove("active");
    this.isOpen = false;

    // Remove body scroll lock
    document.body.style.overflow = "";
  }
}

// Search Functionality
class SearchHandler {
  constructor() {
    this.searchInput = document.querySelector(".search-input");
    this.searchBtn = document.querySelector(".search-btn");

    this.init();
  }

  init() {
    if (this.searchBtn && this.searchInput) {
      this.searchBtn.addEventListener("click", () => this.performSearch());

      this.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch();
        }
      });
    }
  }

  performSearch() {
    const searchTerm = this.searchInput.value.trim();

    if (searchTerm) {
      console.log("Searching for:", searchTerm);
      // Here you would typically make an API call or filter products
      alert(`Searching for: ${searchTerm}`);
      this.searchInput.value = "";
    } else {
      this.searchInput.focus();
    }
  }
}

// Cart Management
class CartManager {
  constructor() {
    this.cartCount = this.getCartItemCount(); // Get from localStorage
    this.cartBadge = document.querySelector(".cart-badge");
    this.cartItems = this.getCartItems();
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Update cart badge on load
    this.updateCartBadge();

    // Initialize cart display if on cart page
    if (this.isCartPage()) {
      this.displayCartItems();
    }

    // Setup cart link
    const cartLink = document.querySelector(".cart-link");
    if (cartLink) {
      cartLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.showCart();
      });
    }

    this.isInitialized = true;
    console.log("CartManager initialized with", this.cartCount, "items");
  }

  isCartPage() {
    return (
      window.location.pathname.includes("cart.html") ||
      document.getElementById("cartPage") ||
      document.querySelector(".cart-section")
    );
  }

  getCartItems() {
    try {
      return JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return [];
    }
  }

  getCartItemCount() {
    const cart = this.getCartItems();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  updateCartCount(count) {
    this.cartCount = count;
    this.updateCartBadge();
  }

  updateCartBadge() {
    if (this.cartBadge) {
      this.cartBadge.textContent = this.cartCount;

      // Add animation
      this.cartBadge.style.transform = "scale(1.2)";
      setTimeout(() => {
        this.cartBadge.style.transform = "scale(1)";
      }, 300);
    }
  }

  addToCart(item) {
    let cart = this.getCartItems();
    console.log("Adding to cart:", item);
    // Validate item
    if (!this.validateCartItem(item)) {
      this.showToast("Invalid product information");
      return false;
    }

    // Generate unique ID based on product ID and variations
    const variationString = JSON.stringify(item.variations || {});
    const uniqueId = `${item.id}-${btoa(variationString)}`;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.uniqueId === uniqueId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += item.quantity;
      cart[existingItemIndex].totalPrice =
        cart[existingItemIndex].price * cart[existingItemIndex].quantity;
      console.log(
        "Updated existing item quantity:",
        cart[existingItemIndex].quantity
      );
    } else {
      // Add new item with complete details
      const cartItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        variations: item.variations || {},
        totalPrice: item.price * item.quantity,
        uniqueId: uniqueId,
        addedAt: new Date().toISOString(),
      };
      cart.push(cartItem);
      console.log("Added new item to cart");
    }
    // Save to localStorage
    this.saveCart(cart);

    // Update internal state
    this.cartItems = cart;
    this.cartCount = this.getCartItemCount();

    // Update UI
    this.updateCartBadge();

    // Show success feedback
    this.showSuccessFeedback();

    // Update cart display if on cart page
    if (this.isCartPage()) {
      this.displayCartItems();
    }

    return true;
  }

  validateCartItem(item) {
    if (!item || typeof item !== "object") {
      console.error("Invalid item object");
      return false;
    }

    if (!item.id || !item.title || !item.price || !item.image) {
      console.error("Missing required item fields");
      return false;
    }

    if (typeof item.quantity !== "number" || item.quantity < 1) {
      console.error("Invalid quantity:", item.quantity);
      return false;
    }

    if (typeof item.price !== "number" || item.price < 0) {
      console.error("Invalid price:", item.price);
      return false;
    }

    return true;
  }

  generateUniqueId(item) {
    const variationString = JSON.stringify(item.variations || {});
    return `${item.id}-${btoa(variationString).slice(0, 8)}`;
  }

  saveCart(cart) {
    try {
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
      console.log("Cart saved to localStorage:", cart.length, "items");
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      this.showToast("Error saving cart data");
    }
  }

  updateCartBadge() {
    if (this.cartBadge) {
      this.cartBadge.textContent = this.cartCount;

      // Add pulse animation
      this.cartBadge.classList.add("pulse");
      setTimeout(() => {
        this.cartBadge.classList.remove("pulse");
      }, 600);

      // Show/hide badge based on count
      if (this.cartCount > 0) {
        this.cartBadge.style.display = "flex";
      } else {
        this.cartBadge.style.display = "none";
      }
    }
  }

  displayCartItems() {
    const cartContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const emptyCart = document.getElementById("emptyCart");
    const cartContent = document.getElementById("cartContent");

    if (!cartContainer) {
      console.log("Cart container not found");
      return;
    }

    const cart = this.getCartItems();
    console.log("Displaying cart items:", cart);

    if (cart.length === 0) {
      if (emptyCart) emptyCart.style.display = "block";
      if (cartContent) cartContent.style.display = "none";
      return;
    }

    if (emptyCart) emptyCart.style.display = "none";
    if (cartContent) cartContent.style.display = "block";

    // Calculate totals
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
      0
    );
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;

    // Update cart items
    cartContainer.innerHTML = cart
      .map(
        (item, index) => `
        <div class="cart-item" data-id="${item.uniqueId}" data-index="${index}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}" 
                     onerror="this.src='https://via.placeholder.com/100x100/ffffff/666666?text=No+Image'">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                ${this.renderVariations(item.variations)}
                <div class="cart-item-price">${this.formatCurrency(
                  item.price
                )} each</div>
                <div class="cart-item-meta">
                    Added: ${new Date(item.addedAt).toLocaleDateString()}
                </div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-quantity">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${
                      item.uniqueId
                    }', -1)" 
                            ${item.quantity <= 1 ? "disabled" : ""}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${
                      item.uniqueId
                    }', 1)"
                            ${item.quantity >= 10 ? "disabled" : ""}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">${this.formatCurrency(
                  item.totalPrice || item.price * item.quantity
                )}</div>
                <button class="remove-item-btn" onclick="cartManager.removeItem('${
                  item.uniqueId
                }')" 
                        title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `
      )
      .join("");

    // Update summary
    if (cartSubtotal) {
      cartSubtotal.textContent = this.formatCurrency(subtotal);
    }
    if (cartTotal) {
      cartTotal.innerHTML = `<strong>${this.formatCurrency(total)}</strong>`;
    }

    // Update tax display
    const taxElement = document.querySelector(
      ".summary-row:nth-child(3) span:last-child"
    );
    if (taxElement) {
      taxElement.textContent = this.formatCurrency(tax);
    }
  }

  renderVariations(variations) {
    if (!variations || Object.keys(variations).length === 0) {
      return "";
    }

    return `
        <div class="cart-item-variations">
            ${Object.entries(variations)
              .filter(([key, value]) => value && value !== "null")
              .map(
                ([key, value]) =>
                  `<span class="variation-chip">${key}: ${value}</span>`
              )
              .join("")}
        </div>
    `;
  }

  updateQuantity(uniqueId, change) {
    let cart = this.getCartItems();
    const itemIndex = cart.findIndex((item) => item.uniqueId === uniqueId);

    if (itemIndex > -1) {
      const newQuantity = cart[itemIndex].quantity + change;

      if (newQuantity < 1) {
        this.removeItem(uniqueId);
        return;
      }

      if (newQuantity > 10) {
        this.showToast("Maximum 10 items per product");
        return;
      }

      cart[itemIndex].quantity = newQuantity;
      cart[itemIndex].totalPrice = cart[itemIndex].price * newQuantity;

      this.saveCart(cart);
      this.cartItems = cart;
      this.cartCount = this.getCartItemCount();
      this.updateCartBadge();
      this.displayCartItems();

      this.showToast(`Quantity updated to ${newQuantity}`);
    }
  }

  removeItem(uniqueId) {
    let cart = this.getCartItems();
    const itemIndex = cart.findIndex((item) => item.uniqueId === uniqueId);

    if (itemIndex > -1) {
      const itemName = cart[itemIndex].title;
      cart = cart.filter((item) => item.uniqueId !== uniqueId);

      this.saveCart(cart);
      this.cartItems = cart;
      this.cartCount = this.getCartItemCount();
      this.updateCartBadge();
      this.displayCartItems();

      this.showToast(`"${itemName}" removed from cart`);
    }
  }

  clearCart() {
    const cart = this.getCartItems();
    if (cart.length === 0) {
      this.showToast("Cart is already empty");
      return;
    }

    if (confirm("Are you sure you want to clear your entire cart?")) {
      localStorage.removeItem("shoppingCart");
      this.cartItems = [];
      this.cartCount = 0;
      this.updateCartBadge();
      this.displayCartItems();
      this.showToast("Cart cleared successfully");
    }
  }

  getCartSummary() {
    const cart = this.getCartItems();
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
      0
    );
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    return {
      itemCount: this.cartCount,
      subtotal: subtotal,
      tax: tax,
      total: total,
      items: cart,
    };
  }

  showCart() {
    // Navigate to cart page
    window.location.href = "cart.html";
  }

  checkout() {
    const cart = this.getCartItems();
    if (cart.length === 0) {
      this.showToast("Your cart is empty!");
      return;
    }

    const summary = this.getCartSummary();
    console.log("Checkout summary:", summary);

    this.showToast("Proceeding to checkout...");

    // Simulate checkout process
    setTimeout(() => {
      // In a real application, you would process payment here
      // For demo purposes, we'll clear the cart after "successful" checkout
      this.clearCart();
      this.showToast("Order placed successfully! Thank you for your purchase.");
    }, 2000);
  }

  showSuccessFeedback() {
    // Show success notification
    this.showToast("Item added to cart!");

    // Add visual feedback to cart icon
    const cartIcon = document.querySelector(".cart-link");
    if (cartIcon) {
      cartIcon.classList.add("cart-bounce");
      setTimeout(() => {
        cartIcon.classList.remove("cart-bounce");
      }, 600);
    }
  }

  showToast(message, type = "success") {
    // Remove existing toasts
    document.querySelectorAll(".cart-toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `cart-toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${
              type === "success" ? "check-circle" : "exclamation-triangle"
            }"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  displayCartItems() {
    const cartContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const emptyCart = document.getElementById("emptyCart");
    const cartContent = document.getElementById("cartContent");

    if (!cartContainer) return;

    const cart = this.getCartItems();

    if (cart.length === 0) {
      if (emptyCart) emptyCart.style.display = "block";
      if (cartContent) cartContent.style.display = "none";
      return;
    }

    if (emptyCart) emptyCart.style.display = "none";
    if (cartContent) cartContent.style.display = "block";

    cartContainer.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item" data-id="${item.uniqueId}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${
          item.title
        }" onerror="this.src='https://via.placeholder.com/100x100/ffffff/666666?text=No+Image'">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                ${
                  item.variations
                    ? `
                <div class="cart-item-variations">
                    ${Object.entries(item.variations)
                      .map(([key, value]) =>
                        value
                          ? `<span class="variation-chip">${key}: ${value}</span>`
                          : ""
                      )
                      .join("")}
                </div>
                `
                    : ""
                }
                <div class="cart-item-price">${this.formatCurrency(
                  item.price
                )} each</div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-quantity">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${
                      item.uniqueId
                    }', -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${
                      item.uniqueId
                    }', 1)">+</button>
                </div>
                <div class="cart-item-total">${this.formatCurrency(
                  item.totalPrice || item.price * item.quantity
                )}</div>
                <button class="remove-item-btn" onclick="cartManager.removeItem('${
                  item.uniqueId
                }')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `
      )
      .join("");

    // Update total
    if (cartTotal) {
      const total = cart.reduce(
        (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
        0
      );
      cartTotal.textContent = this.formatCurrency(total);
    }
  }
  updateQuantity(uniqueId, change) {
    let cart = this.getCartItems();
    const itemIndex = cart.findIndex((item) => item.uniqueId === uniqueId);

    if (itemIndex > -1) {
      const newQuantity = cart[itemIndex].quantity + change;

      if (newQuantity < 1) {
        this.removeItem(uniqueId);
        return;
      }

      if (newQuantity > 10) {
        this.showToast("Maximum 10 items per product");
        return;
      }

      cart[itemIndex].quantity = newQuantity;
      cart[itemIndex].totalPrice = cart[itemIndex].price * newQuantity;

      localStorage.setItem("shoppingCart", JSON.stringify(cart));
      this.cartItems = cart;
      this.cartCount = this.getCartItemCount();
      this.updateCartBadge();
      this.displayCartItems();
    }
  }

  removeItem(uniqueId) {
    let cart = this.getCartItems();
    cart = cart.filter((item) => item.uniqueId !== uniqueId);

    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    this.cartItems = cart;
    this.cartCount = this.getCartItemCount();
    this.updateCartBadge();
    this.displayCartItems();

    this.showToast("Item removed from cart");
  }

  clearCart() {
    localStorage.removeItem("shoppingCart");
    this.cartItems = [];
    this.cartCount = 0;
    this.updateCartBadge();
    this.displayCartItems();
    this.showToast("Cart cleared");
  }

  showCart() {
    // Navigate to cart page or show cart modal
    window.location.href = "cart.html";
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
  // Add this method to the CartManager class
  checkout() {
    const cart = this.getCartItems();
    if (cart.length === 0) {
      this.showToast("Your cart is empty!");
      return;
    }

    // Here you would typically redirect to a checkout page
    // For now, show a success message
    this.showToast("Proceeding to checkout...");

    // Simulate checkout process
    setTimeout(() => {
      this.clearCart();
      this.showToast("Order placed successfully! Thank you for your purchase.");
    }, 2000);
  }
}

// Active Navigation Link Handler
class NavigationHandler {
  constructor() {
    this.navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

    this.init();
  }

  init() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.setActiveLink(link);

        // You can add navigation logic here
        const target = link.getAttribute("href");
        console.log("Navigating to:", target);

        // Handle internal navigation
        if (target.startsWith("#")) {
          const section = document.querySelector(target);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          // External navigation
          window.location.href = target;
        }
      });
    });
  }

  setActiveLink(activeLink) {
    this.navLinks.forEach((link) => {
      link.classList.remove("active");
    });
    activeLink.classList.add("active");
  }
}

// Hero Section Animations and Interactions
class HeroSection {
  constructor() {
    this.shopNowBtn = document.getElementById("shopNowBtn");
    this.exploreBtn = document.getElementById("exploreBtn");
    this.scrollIndicator = document.querySelector(".scroll-indicator");

    // Only initialize if we're on the home page
    if (this.shopNowBtn || this.exploreBtn) {
      this.init();
    }
  }

  init() {
    // Add click handlers for CTA buttons
    if (this.shopNowBtn) {
      this.shopNowBtn.addEventListener("click", () => this.handleShopNow());
    }

    if (this.exploreBtn) {
      this.exploreBtn.addEventListener("click", () => this.handleExplore());
    }

    // Add scroll indicator click handler
    if (this.scrollIndicator) {
      this.scrollIndicator.addEventListener("click", () =>
        this.scrollToFeatured()
      );
    }

    // Add intersection observer for animations
    this.setupAnimations();
  }

  handleShopNow() {
    console.log("Shop Now clicked - navigating to products");
    // Add ripple effect
    this.createRippleEffect(this.shopNowBtn);

    // Simulate navigation delay
    setTimeout(() => {
      window.location.href = "index.html#products";
    }, 300);
  }

  handleExplore() {
    console.log("Explore More clicked");
    this.createRippleEffect(this.exploreBtn);

    setTimeout(() => {
      this.scrollToFeatured();
    }, 300);
  }

  scrollToFeatured() {
    const featuredSection = document.querySelector(".featured-preview");
    if (featuredSection) {
      featuredSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  createRippleEffect(button) {
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  setupAnimations() {
    // Add CSS for ripple effect
    const style = document.createElement("style");
    style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .btn {
                position: relative;
                overflow: hidden;
            }
        `;
    document.head.appendChild(style);

    // Observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe preview items
    document.querySelectorAll(".preview-item").forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(30px)";
      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(item);
    });
  }
}

/// Initialize all functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing ecommerce application...");

  // Make cartManager globally accessible
  window.cartManager = new CartManager();

  // Initialize other components
  new MobileNavigation();
  new SearchHandler();
  new NavigationHandler();
  new HeroSection();

  // Initialize product grid only if we're on the products page
  if (document.getElementById("productGrid")) {
    window.productGrid = new ProductGrid();
  }

  console.log("Ecommerce frontend initialized successfully!");
  console.log("Cart items on load:", window.cartManager.getCartItems().length);
});

// Add error handling for window
window.addEventListener("error", function (e) {
  console.error("Global error:", e.error);
});

// Export for global access
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CartManager, ProductGrid };
}

// Additional utility functions
const utils = {
  // Debounce function for search input
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
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Preload image function
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  },
};

// Add error handling for window
window.addEventListener("error", function (e) {
  console.error("Global error:", e.error);
});

// Add this method to check authentication for protected pages
function requireAuth() {
  if (!authManager || !authManager.isUserAuthenticated()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Example usage for protected pages
// if (window.location.pathname.includes('profile.html')) {
//     document.addEventListener('DOMContentLoaded', function() {
//         if (!requireAuth()) return;
//         // Load protected content
//     });
// }
