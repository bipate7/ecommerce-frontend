// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyByxD4BzZ16gfftKVEG0QnHeG5dH2aGmp8",
  authDomain: "shopeasy-ecommerce-573ec.firebaseapp.com",
  projectId: "shopeasy-ecommerce-573ec",
  storageBucket: "shopeasy-ecommerce-573ec.firebasestorage.app",
  messagingSenderId: "802963688662",
  appId: "1:802963688662:web:8dec224e4c61715a48cd77",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/// Authentication Management with Firebase
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.auth = auth;
    this.init();
  }

  init() {
    this.setupAuthStateListener();
    this.setupEventListeners();
    this.updateAuthUI();
  }

  setupAuthStateListener() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        };
        console.log("User signed in:", this.currentUser);
      } else {
        this.currentUser = null;
        console.log("User signed out");
      }
      this.updateAuthUI();
    });
  }
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginFormElement");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Signup form
    const signupForm = document.getElementById("signupFormElement");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e));
    }

    // Password toggles
    this.setupPasswordToggles();

    // Forgot password
    this.setupForgotPassword();

    // Real-time validation
    this.setupRealTimeValidation();
  }

  setupPasswordToggles() {
    // Login password toggle
    const loginToggle = document.getElementById("loginPasswordToggle");
    if (loginToggle) {
      loginToggle.addEventListener("click", () =>
        this.togglePasswordVisibility("loginPassword", loginToggle)
      );
    }

    // Signup password toggle
    const signupToggle = document.getElementById("signupPasswordToggle");
    if (signupToggle) {
      signupToggle.addEventListener("click", () =>
        this.togglePasswordVisibility("signupPassword", signupToggle)
      );
    }

    // Confirm password toggle
    const confirmToggle = document.getElementById("confirmPasswordToggle");
    if (confirmToggle) {
      confirmToggle.addEventListener("click", () =>
        this.togglePasswordVisibility("confirmPassword", confirmToggle)
      );
    }
  }

  togglePasswordVisibility(inputId, toggleBtn) {
    const input = document.getElementById(inputId);
    const icon = toggleBtn.querySelector("i");

    if (input.type === "password") {
      input.type = "text";
      icon.className = "fas fa-eye-slash";
      toggleBtn.setAttribute("aria-label", "Hide password");
    } else {
      input.type = "password";
      icon.className = "fas fa-eye";
      toggleBtn.setAttribute("aria-label", "Show password");
    }
  }

  setupForgotPassword() {
    const forgotLink = document.querySelector(".forgot-password");
    const modal = document.getElementById("forgotPasswordModal");
    const closeBtn = document.getElementById("forgotPasswordClose");
    const form = document.getElementById("forgotPasswordForm");

    if (forgotLink && modal) {
      forgotLink.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("show");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => this.handleForgotPassword(e));
    }

    // Close modal on outside click
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("show");
        }
      });
    }
  }

  setupRealTimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateEmail(input));
    });

    // Password strength
    const passwordInput = document.getElementById("signupPassword");
    if (passwordInput) {
      passwordInput.addEventListener("input", () =>
        this.checkPasswordStrength(passwordInput.value)
      );
    }

    // Confirm password
    const confirmInput = document.getElementById("confirmPassword");
    if (confirmInput) {
      confirmInput.addEventListener("blur", () => this.validatePasswordMatch());
    }
  }

  validateEmail(input) {
    const email = input.value.trim();
    const errorElement = document.getElementById(input.id + "Error");

    if (!email) {
      this.showError(input, errorElement, "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError(input, errorElement, "Please enter a valid email address");
      return false;
    }

    this.showSuccess(input, errorElement);
    return true;
  }

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    if (!hasUpperCase) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!hasLowerCase) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!hasNumbers) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    return { valid: true, message: "Password is strong" };
  }

  checkPasswordStrength(password) {
    const strengthElement = document.getElementById("passwordStrength");
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (!strengthElement || password.length === 0) {
      if (strengthElement) strengthElement.classList.remove("show");
      return;
    }

    strengthElement.classList.add("show");

    const validation = this.validatePassword(password);
    let strength = "weak";
    let strengthMessage = "Weak password";

    if (validation.valid) {
      if (password.length >= 8) {
        strength = "strong";
        strengthMessage = "Strong password";
      } else {
        strength = "medium";
        strengthMessage = "Medium password";
      }
    }
    strengthFill.className = `strength-fill ${strength}`;
    strengthText.textContent = strengthMessage;
  }

  validatePasswordMatch() {
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorElement = document.getElementById("confirmPasswordError");

    if (!confirmPassword) {
      this.showError(
        document.getElementById("confirmPassword"),
        errorElement,
        "Please confirm your password"
      );
      return false;
    }

    if (password !== confirmPassword) {
      this.showError(
        document.getElementById("confirmPassword"),
        errorElement,
        "Passwords do not match"
      );
      return false;
    }

    this.showSuccess(document.getElementById("confirmPassword"), errorElement);
    return true;
  }

  async handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const button = document.getElementById("loginBtn");

    // Validate inputs
    if (!this.validateEmail(document.getElementById("loginEmail"))) {
      return;
    }

    if (!password) {
      this.showError(
        document.getElementById("loginPassword"),
        document.getElementById("loginPasswordError"),
        "Password is required"
      );
      return;
    }

    // Show loading state
    this.setButtonLoading(button, true);

    try {
      // Firebase authentication
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      this.showToast("Login successful!", "success");

      // Redirect to home page after successful login
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      this.handleAuthError(error, "login");
      this.setButtonLoading(button, false);
    }
  }

  async handleSignup(e) {
    e.preventDefault();

    const form = e.target;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;
    const button = document.getElementById("signupBtn");

    // Validate all fields
    let isValid = true;

    if (!firstName) {
      this.showError(
        document.getElementById("firstName"),
        document.getElementById("firstNameError"),
        "First name is required"
      );
      isValid = false;
    }

    if (!lastName) {
      this.showError(
        document.getElementById("lastName"),
        document.getElementById("lastNameError"),
        "Last name is required"
      );
      isValid = false;
    }

    if (!this.validateEmail(document.getElementById("signupEmail"))) {
      isValid = false;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      this.showError(
        document.getElementById("signupPassword"),
        document.getElementById("signupPasswordError"),
        passwordValidation.message
      );
      isValid = false;
    }

    if (!this.validatePasswordMatch()) {
      isValid = false;
    }

    if (!agreeTerms) {
      this.showError(
        document.getElementById("agreeTerms"),
        document.getElementById("termsError"),
        "You must agree to the terms and conditions"
      );
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Show loading state
    this.setButtonLoading(button, true);

    try {
      // Firebase authentication
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // Update user profile with display name
      await user.updateProfile({
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification
      await user.sendEmailVerification();

      this.showToast(
        "Account created successfully! Please check your email for verification.",
        "success"
      );

      // Redirect to home page after successful signup
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      this.handleAuthError(error, "signup");
      this.setButtonLoading(button, false);
    }
  }

  async handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    const modal = document.getElementById("forgotPasswordModal");

    if (!this.validateEmail(document.getElementById("resetEmail"))) {
      return;
    }

    try {
      // Send password reset email
      await this.auth.sendPasswordResetEmail(email);

      this.showToast(
        "Password reset instructions sent to your email",
        "success"
      );
      modal.classList.remove("show");
    } catch (error) {
      this.handleAuthError(error, "reset");
    }
  }
  handleAuthError(error, context) {
    let errorMessage = "An error occurred. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage =
          "This email is already registered. Please use a different email or try logging in.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address format.";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak. Please use a stronger password.";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this email address.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password. Please try again.";
        break;
      case "auth/too-many-requests":
        errorMessage =
          "Too many unsuccessful attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection.";
        break;
      default:
        errorMessage =
          error.message || "Authentication failed. Please try again.";
    }

    this.showToast(errorMessage, "error");
    console.error(`Firebase ${context} error:`, error);
  }
  async logout() {
    try {
      await this.auth.signOut();
      this.showToast("Logged out successfully", "success");

      // Redirect to home page after logout
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      this.showToast("Logout failed. Please try again.", "error");
    }
  }

  isUserAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateAuthUI() {
    const userLink = document.querySelector(".user-link");
    const userText = document.querySelector(".user-text");
    const userIcon = document.querySelector(".user-link i");

    if (userLink && userText && userIcon) {
      if (this.currentUser) {
        userText.textContent = this.currentUser.displayName || "My Account";
        userIcon.className = "fas fa-user-check";
        userLink.href = "#";
        userLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.logout();
        });
      } else {
        userText.textContent = window.location.pathname.includes("signup.html")
          ? "Sign Up"
          : "Login";
        userIcon.className = "fas fa-user";
        userLink.href = window.location.pathname.includes("signup.html")
          ? "login.html"
          : "signup.html";
        // Remove existing event listeners
        userLink.replaceWith(userLink.cloneNode(true));
      }
    }

    // Update mobile navigation
    const mobileAuthLink = document.querySelector(
      '.mobile-nav-link[href*="login"], .mobile-nav-link[href*="signup"]'
    );
    if (mobileAuthLink) {
      if (this.currentUser) {
        mobileAuthLink.textContent = "Logout";
        mobileAuthLink.href = "#";
        mobileAuthLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.logout();
        });
      } else {
        mobileAuthLink.textContent = window.location.pathname.includes(
          "signup.html"
        )
          ? "Sign Up"
          : "Login";
        mobileAuthLink.href = window.location.pathname.includes("signup.html")
          ? "login.html"
          : "signup.html";
      }
    }
  }

  setButtonLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.classList.add("loading");
    } else {
      button.disabled = false;
      button.classList.remove("loading");
    }
  }

  showError(input, errorElement, message) {
    if (input) input.classList.add("error");
    if (input) input.classList.remove("success");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
  }

  showSuccess(input, errorElement) {
    if (input) input.classList.remove("error");
    if (input) input.classList.add("success");
    if (errorElement) errorElement.classList.remove("show");
  }

  showToast(message, type = "success") {
    // Remove existing toasts
    document.querySelectorAll(".auth-toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `auth-toast toast-${type}`;
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

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }

  authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem("shopEasyUsers") || "[]");
    return users.find(
      (user) => user.email === email && user.password === password
    );
  }

  createUser(userData) {
    const users = JSON.parse(localStorage.getItem("shopEasyUsers") || "[]");

    // Check if user already exists
    if (users.find((user) => user.email === userData.email)) {
      throw new Error("User already exists");
    }

    const user = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      cart: [],
    };

    users.push(user);
    localStorage.setItem("shopEasyUsers", JSON.stringify(users));

    return user;
  }

  login(user) {
    this.currentUser = user;
    localStorage.setItem("shopEasyCurrentUser", JSON.stringify(user));
    this.updateAuthUI();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("shopEasyCurrentUser");
    this.updateAuthUI();
    this.showToast("Logged out successfully", "success");
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("shopEasyCurrentUser"));
    } catch (error) {
      return null;
    }
  }

  updateAuthUI() {
    const userLink = document.querySelector(".user-link");
    const userText = document.querySelector(".user-text");

    if (userLink && userText) {
      if (this.currentUser) {
        userText.textContent = this.currentUser.firstName;
        userLink.href = "#";
        userLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.logout();
        });
      } else {
        userText.textContent = window.location.pathname.includes("signup.html")
          ? "Sign Up"
          : "Login";
        userLink.href = window.location.pathname.includes("signup.html")
          ? "login.html"
          : "signup.html";
      }
    }
  }

  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add("loading");
    } else {
      button.disabled = false;
      button.classList.remove("loading");
    }
  }

  showError(input, errorElement, message) {
    input.classList.add("error");
    input.classList.remove("success");
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }

  showSuccess(input, errorElement) {
    input.classList.remove("error");
    input.classList.add("success");
    errorElement.classList.remove("show");
  }

  showToast(message, type = "success") {
    // Remove existing toasts
    document.querySelectorAll(".auth-toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `auth-toast toast-${type}`;
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

  simulateAPICall(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
}

// Initialize auth manager when DOM is loaded
let authManager;

document.addEventListener("DOMContentLoaded", function () {
  authManager = new AuthManager();
});
