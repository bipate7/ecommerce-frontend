// Product Detail Page Management
class ProductDetail {
  constructor() {
    this.productId = this.getProductIdFromURL();
    this.product = null;
    this.quantity = 1;
    this.selectedVariations = {
      size: null,
      color: null,
      material: null,
    };
    this.basePrice = 0;
    this.currentPrice = 0;
    this.discount = 0;

    this.init();
  }

  init() {
    if (this.productId) {
      this.loadProductDetail();
      this.setupEventListeners();
      this.initializeVariations();
    } else {
      this.showErrorState();
    }
  }

  getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async loadProductDetail() {
    try {
      this.showLoading();

      // Fetch product details from API
      this.product = await apiService.fetchProductById(this.productId);

      if (this.product) {
        this.renderProductDetail();
        this.loadRelatedProducts();
        this.hideLoading();
      } else {
        this.showErrorState();
      }
    } catch (error) {
      console.error("Error loading product detail:", error);
      this.showErrorState();
    }
  }

  renderProductDetail() {
    // Update breadcrumb
    document.getElementById("breadcrumb-category").textContent =
      this.formatCategory(this.product.category);
    document.getElementById("breadcrumb-title").textContent =
      this.product.title;

    // Update main content
    document.getElementById("productCategory").textContent =
      this.formatCategory(this.product.category);
    document.getElementById("productTitle").textContent = this.product.title;
    document.getElementById("productDescriptionFull").textContent =
      this.product.description;

    // Update pricing
    const currentPrice = this.product.currentPrice || this.product.price;
    const discount = this.product.discount || 0;

    document.getElementById("currentPrice").textContent =
      this.formatCurrency(currentPrice);

    if (discount > 0) {
      document.getElementById("originalPrice").textContent =
        this.formatCurrency(this.product.price);
      document.getElementById(
        "discountBadge"
      ).textContent = `Save ${discount}%`;
    } else {
      document.getElementById("originalPrice").style.display = "none";
      document.getElementById("discountBadge").style.display = "none";
    }

    // Update rating
    this.renderRating(this.product.rating);

    // Update stock info
    this.renderStockInfo(this.product.stock);

    // Update images
    this.renderProductImages();

    // Show main content
    document.getElementById("productDetailMain").style.display = "grid";
  }

  renderRating(rating) {
    const ratingElement = document.getElementById("productRating");
    const starsElement = ratingElement.querySelector(".rating-stars");
    const countElement = ratingElement.querySelector(".rating-count");
    const textElement = ratingElement.querySelector(".rating-text");

    starsElement.innerHTML = this.generateStarRating(rating.rate);
    countElement.textContent = `(${rating.count} reviews)`;

    // Add rating text based on score
    if (rating.rate >= 4.5) {
      textElement.textContent = "Excellent";
    } else if (rating.rate >= 4.0) {
      textElement.textContent = "Very Good";
    } else if (rating.rate >= 3.0) {
      textElement.textContent = "Good";
    } else {
      textElement.textContent = "Average";
    }
  }

  renderStockInfo(stock) {
    const stockElement = document.getElementById("stockInfo");
    const icon = stockElement.querySelector("i");
    const text = stockElement.querySelector("span");

    if (stock > 10) {
      text.textContent = `In Stock (${stock} available)`;
      icon.className = "fas fa-check-circle";
      stockElement.className = "stock-info";
    } else if (stock > 0) {
      text.textContent = `Low Stock (Only ${stock} left)`;
      icon.className = "fas fa-exclamation-triangle";
      stockElement.className = "stock-info low-stock";
    } else {
      text.textContent = "Out of Stock";
      icon.className = "fas fa-times-circle";
      stockElement.className = "stock-info out-of-stock";
    }
  }

  renderProductImages() {
    const mainImage = document.getElementById("mainProductImage");
    const thumbnailsContainer = document.getElementById("imageThumbnails");

    // Set main image
    mainImage.src = this.product.image;
    mainImage.alt = this.product.title;

    // Create thumbnails (for demo, using same image multiple times)
    // In real scenario, you might have multiple images from API
    const thumbnailImages = [
      this.product.image,
      this.product.image, // Would be different images in real scenario
      this.product.image,
      this.product.image,
    ];

    thumbnailsContainer.innerHTML = thumbnailImages
      .map(
        (imgSrc, index) => `
            <div class="thumbnail ${
              index === 0 ? "active" : ""
            }" data-image="${imgSrc}">
                <img src="${imgSrc}" alt="${this.product.title} - View ${
          index + 1
        }">
            </div>
        `
      )
      .join("");

    // Add click handlers for thumbnails
    thumbnailsContainer.querySelectorAll(".thumbnail").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        this.switchMainImage(thumb.getAttribute("data-image"));
        thumbnailsContainer
          .querySelectorAll(".thumbnail")
          .forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  }

  switchMainImage(imageSrc) {
    const mainImage = document.getElementById("mainProductImage");
    const zoomedImage = document.getElementById("zoomedImage");

    mainImage.src = imageSrc;
    zoomedImage.src = imageSrc;
  }

  async loadRelatedProducts() {
    try {
      const relatedProducts = await apiService.fetchProductsByCategory(
        this.product.category
      );
      // Filter out current product and take first 4
      const filteredProducts = relatedProducts
        .filter((p) => p.id !== this.product.id)
        .slice(0, 4);

      this.renderRelatedProducts(filteredProducts);
    } catch (error) {
      console.error("Error loading related products:", error);
    }
  }

  renderRelatedProducts(products) {
    const container = document.getElementById("relatedProductsGrid");

    if (products.length === 0) {
      container.innerHTML =
        '<p class="no-related">No related products found.</p>';
      return;
    }

    container.innerHTML = products
      .map(
        (product) => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" 
                         onload="this.classList.add('loaded')"
                         onerror="this.src='https://via.placeholder.com/300x300/ffffff/666666?text=Image+Not+Found'">
                    <div class="image-placeholder"></div>
                </div>
                <div class="product-content">
                    <span class="product-category">${this.formatCategory(
                      product.category
                    )}</span>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">
                        <span class="current-price">${this.formatCurrency(
                          product.currentPrice || product.price
                        )}</span>
                        ${
                          product.discount > 0
                            ? `
                            <span class="original-price">${this.formatCurrency(
                              product.price
                            )}</span>
                        `
                            : ""
                        }
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="productDetail.addRelatedToCart(${
                          product.id
                        })">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  setupEventListeners() {
    // Enhanced quantity controls
    document
      .getElementById("increaseQuantity")
      .addEventListener("click", () => {
        this.updateQuantity(1);
      });

    document
      .getElementById("decreaseQuantity")
      .addEventListener("click", () => {
        this.updateQuantity(-1);
      });

    document.getElementById("quantity").addEventListener("change", (e) => {
      this.quantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
      e.target.value = this.quantity;
    });

    // Enhanced add to cart with validation
    document.getElementById("addToCartDetail").addEventListener("click", () => {
      if (this.validateSelections()) {
        this.addToCart();
      }
    });

    // Buy now with validation
    document.getElementById("buyNowBtn").addEventListener("click", () => {
      if (this.validateSelections()) {
        this.buyNow();
      }
    });

    // Wishlist
    document.getElementById("wishlistDetail").addEventListener("click", () => {
      this.toggleWishlist();
    });

    // Enhanced image zoom
    this.setupEnhancedImageZoom();

    // Success notification close
    document.querySelector(".success-close")?.addEventListener("click", () => {
      this.hideSuccessNotification();
    });

    // Auto-hide success notification
    setTimeout(() => {
      this.hideSuccessNotification();
    }, 5000);
  }
  validateSelections() {
    const requiredVariations = ["size", "color"];
    let isValid = true;

    requiredVariations.forEach((variation) => {
      if (!this.selectedVariations[variation]) {
        this.showVariationFeedback(variation, null, false);
        isValid = false;

        // Add shake animation to variation group
        const variationGroup = document
          .querySelector(`#${variation}Options`)
          .closest(".variation-group");
        variationGroup.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
          variationGroup.style.animation = "";
        }, 500);
      }
    });

    if (!isValid) {
      this.showErrorToast("Please select all required options");
    }

    return isValid;
  }

  updateQuantity(change) {
    const newQuantity = Math.max(1, Math.min(10, this.quantity + change));

    if (newQuantity !== this.quantity) {
      this.quantity = newQuantity;
      document.getElementById("quantity").value = this.quantity;

      // Update quantity display
      document.getElementById(
        "quantityDisplay"
      ).textContent = `${this.quantity} x`;

      // Update price
      this.updatePrice();

      // Update quantity message
      this.updateQuantityMessage();

      // Enable/disable buttons
      this.updateQuantityButtons();
    }
  }
  updateQuantityMessage() {
    const message = document.getElementById("quantityMessage");
    if (this.quantity >= 10) {
      message.textContent = "Maximum quantity reached";
      message.style.color = "#dc3545";
    } else if (this.quantity >= 8) {
      message.textContent = "Only a few left at this quantity";
      message.style.color = "#ffc107";
    } else {
      message.textContent = "Maximum 10 items per order";
      message.style.color = "#666";
    }
  }
  updateQuantityButtons() {
    const decreaseBtn = document.getElementById("decreaseQuantity");
    const increaseBtn = document.getElementById("increaseQuantity");

    decreaseBtn.disabled = this.quantity <= 1;
    increaseBtn.disabled = this.quantity >= 10;
  }

  updatePrice() {
    if (!this.product) return;

    // Calculate total price
    const unitPrice = this.product.currentPrice || this.product.price;
    const totalPrice = unitPrice * this.quantity;
    const totalDiscount =
      this.product.discount > 0
        ? this.product.price * this.quantity - totalPrice
        : 0;

    // Update displays
    document.getElementById("basePrice").textContent = this.formatCurrency(
      this.product.price * this.quantity
    );
    document.getElementById(
      "totalPrice"
    ).innerHTML = `<strong>${this.formatCurrency(totalPrice)}</strong>`;

    if (totalDiscount > 0) {
      document.getElementById(
        "discountAmount"
      ).textContent = `-${this.formatCurrency(totalDiscount)}`;
      document.querySelector(".discount-row").style.display = "flex";
    } else {
      document.querySelector(".discount-row").style.display = "none";
    }

    // Add loading animation
    this.animatePriceUpdate();
  }
  animatePriceUpdate() {
    const priceElements = [
      document.getElementById("basePrice"),
      document.getElementById("totalPrice"),
      document.getElementById("discountAmount"),
    ];

    priceElements.forEach((element) => {
      element.classList.add("price-updating");
      setTimeout(() => {
        element.classList.remove("price-updating");
      }, 500);
    });
  }

  addToCart() {
    if (!this.product || !this.validateSelections()) return;

    const button = document.getElementById("addToCartDetail");
    if (!button || button.disabled) return;

    // Disable button temporarily
    button.disabled = true;
    const originalText = button.innerHTML;

    // Show loading state
    button.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Adding to Cart...';
    button.classList.add("loading");

    const cartItem = {
      id: this.product.id,
      title: this.product.title,
      price: this.product.currentPrice || this.product.price,
      image: this.product.image,
      quantity: this.quantity,
      variations: { ...this.selectedVariations },
      totalPrice:
        (this.product.currentPrice || this.product.price) * this.quantity,
    };

    // Use the global cartManager
    if (window.cartManager) {
      const success = window.cartManager.addToCart(cartItem);

      if (success) {
        // Show success state
        button.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        button.classList.add("added");

        // Show success notification
        this.showSuccessNotification();

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

    // Add to cart (you'll need to implement cart management)
    this.addToCartManager(cartItem);

    // Show success message
    this.showToast("Product added to cart!");
  }

  addRelatedToCart(productId) {
    // This would fetch the product and add it to cart
    // For now, just show a message
    this.showToast("Product added to cart!");
  }

  buyNow() {
    this.addToCart();
    // Redirect to checkout page (to be implemented)
    this.showToast("Proceeding to checkout...");
  }

  toggleWishlist() {
    const wishlistBtn = document.getElementById("wishlistDetail");
    const icon = wishlistBtn.querySelector("i");

    wishlistBtn.classList.toggle("active");

    if (wishlistBtn.classList.contains("active")) {
      icon.className = "fas fa-heart";
      this.showToast("Added to wishlist!");
    } else {
      icon.className = "far fa-heart";
      this.showToast("Removed from wishlist!");
    }
  }

  setupEnhancedImageZoom() {
    const mainImage = document.getElementById("mainProductImage");
    const zoomContainer = document.getElementById("imageZoom");
    const zoomedImage = document.getElementById("zoomedImage");

    if (!mainImage || !zoomContainer) return;

    // Create zoom lens
    const zoomLens = document.createElement("div");
    zoomLens.className = "zoom-lens";
    mainImage.parentElement.appendChild(zoomLens);

    mainImage.addEventListener("mouseenter", () => {
      if (window.innerWidth > 768) {
        // Only enable zoom on desktop
        zoomContainer.classList.add("active");
        zoomedImage.src = mainImage.src;
        zoomLens.style.display = "block";
      }
    });

    mainImage.addEventListener("mouseleave", () => {
      zoomContainer.classList.remove("active");
      zoomLens.style.display = "none";
    });

    mainImage.addEventListener("mousemove", (e) => {
      if (!zoomContainer.classList.contains("active")) return;

      const { left, top, width, height } = mainImage.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;

      // Update lens position
      const lensSize = 100;
      zoomLens.style.width = lensSize + "px";
      zoomLens.style.height = lensSize + "px";
      zoomLens.style.left = e.clientX - left - lensSize / 2 + "px";
      zoomLens.style.top = e.clientY - top - lensSize / 2 + "px";

      // Calculate zoom
      const zoomLevel = 2;
      const bgX = x * zoomLevel - lensSize / 2;
      const bgY = y * zoomLevel - lensSize / 2;

      zoomedImage.style.transform = `scale(${zoomLevel}) translate(${-bgX}%, ${-bgY}%)`;
    });

    // Touch support for mobile
    mainImage.addEventListener("touchstart", (e) => {
      if (window.innerWidth <= 768) {
        // Show fullscreen image on mobile tap
        this.showFullscreenImage();
      }
    });
  }

  showFullscreenImage() {
    const mainImage = document.getElementById("mainProductImage");
    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;

    const fullscreenImg = document.createElement("img");
    fullscreenImg.src = mainImage.src;
    fullscreenImg.alt = mainImage.alt;
    fullscreenImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        `;

    overlay.appendChild(fullscreenImg);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });
  }

  addToCart() {
    if (!this.product || !this.validateSelections()) return;

    const cartItem = {
      id: this.product.id,
      title: this.product.title,
      price: this.product.currentPrice || this.product.price,
      image: this.product.image,
      quantity: this.quantity,
      variations: { ...this.selectedVariations },
      totalPrice:
        (this.product.currentPrice || this.product.price) * this.quantity,
    };

    // Add to cart with enhanced feedback
    this.addToCartManager(cartItem);

    // Show enhanced success notification
    this.showSuccessNotification();

    // Pulse cart badge animation
    this.pulseCartBadge();
  }

  showSuccessNotification() {
    const notification = document.getElementById("addToCartSuccess");
    notification.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideSuccessNotification();
    }, 5000);
  }

  hideSuccessNotification() {
    const notification = document.getElementById("addToCartSuccess");
    notification.classList.remove("show");
  }

  pulseCartBadge() {
    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
      cartBadge.classList.add("pulse");
      setTimeout(() => {
        cartBadge.classList.remove("pulse");
      }, 600);
    }
  }

  addToCartManager(item) {
    let cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");

    // Generate unique ID based on product ID and variations
    const variationString = JSON.stringify(item.variations);
    const uniqueId = `${item.id}-${btoa(variationString)}`;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.uniqueId === uniqueId
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += item.quantity;
      cart[existingItemIndex].totalPrice =
        cart[existingItemIndex].price * cart[existingItemIndex].quantity;
    } else {
      cart.push({
        ...item,
        uniqueId: uniqueId,
      });
    }

    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    this.updateCartCount();
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
      cartBadge.textContent = totalItems;
    }
  }

  checkAddToCartAvailability() {
    const addToCartBtn = document.getElementById("addToCartDetail");
    const requiredVariations = ["size", "color"];
    const allSelected = requiredVariations.every(
      (variation) => this.selectedVariations[variation] !== null
    );

    if (allSelected) {
      addToCartBtn.disabled = false;
      addToCartBtn.style.opacity = "1";
    } else {
      addToCartBtn.disabled = true;
      addToCartBtn.style.opacity = "0.7";
    }
  }

  // Enhanced error toast
  showErrorToast(message) {
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

    document.body.appendChild(toast);

    // Add shake animation
    toast.style.animation = "shake 0.5s ease-in-out";

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);

    toast.querySelector(".toast-close").addEventListener("click", () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }

  // Update renderProductDetail to initialize prices
  renderProductDetail() {
    // ... (existing code)

    // Initialize prices
    this.basePrice = this.product.price;
    this.currentPrice = this.product.currentPrice || this.product.price;
    this.discount = this.product.discount || 0;

    // Update price display
    this.updatePrice();

    // Initialize quantity controls
    this.updateQuantityMessage();
    this.updateQuantityButtons();

    // Check add to cart availability
    this.checkAddToCartAvailability();
  }
}

// Add shake animation to CSS
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Initialize product detail when DOM is loaded
let productDetail;

document.addEventListener("DOMContentLoaded", function () {
  productDetail = new ProductDetail();
});
