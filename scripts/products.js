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

    this.init();
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
    this.loadMoreBtn.addEventListener("click", () => {
      this.loadMoreProducts();
    });

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
                
                <div class="product-image">
                    <img 
                        src="${product.image}" 
                        alt="${product.title}"
                        onload="this.classList.add('loaded'); this.nextElementSibling.style.display='none';"
                        onerror="this.src='https://via.placeholder.com/300x300/ffffff/666666?text=Image+Not+Found'; this.classList.add('loaded'); this.nextElementSibling.style.display='none';"
                    >
                    <div class="image-placeholder"></div>
                </div>
                
                <div class="product-content">
                    <span class="product-category">${this.formatCategory(
                      product.category
                    )}</span>
                    <h3 class="product-title">${product.title}</h3>
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

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
    button.classList.add("added");

    if (window.cartManager) {
      window.cartManager.updateCartCount(window.cartManager.cartCount + 1);
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

// Initialize product grid when DOM is loaded
let productGrid;

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing product grid...");
  productGrid = new ProductGrid();
});

// Add error handling for window
window.addEventListener("error", function (e) {
  console.error("Global error:", e.error);
});
