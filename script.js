const PRODUCTS_KEY = "products";
let PRODUCTS = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [
  { id: 1, name: "روسری ابریشم مجلسی بنفش",    price: 1480000, image: "images/scarf1.jpg" },
  { id: 2, name: "روسری نخی طرح‌دار کرم",       price: 580000,  image: "images/scarf2.jpg" },
  { id: 3, name: "روسری ساتن کریستال‌دوزی",     price: 2350000, image: "images/scarf3.jpg" },
  { id: 4, name: "روسری ابریشم ساده مشکی",      price: 980000,  image: "images/scarf4.jpg" }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

const els = {
  loginSection: document.getElementById("login-section"),
  customerSection: document.getElementById("customer-section"),
  adminSection: document.getElementById("admin-section"),
  productGrid: document.getElementById("product-grid"),
  cartItems: document.getElementById("cart-items"),
  cartTotal: document.getElementById("cart-total"),
  adminProductList: document.getElementById("admin-product-list"),
  userGreeting: document.getElementById("user-greeting"),
  logoutBtn: document.getElementById("logout-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  searchInput: document.getElementById("search-input"),
  backToTop: document.getElementById("back-to-top"),
  manageBtn: document.getElementById("manage-products-btn"),
  notificationToast: document.getElementById("notification-toast")
};

// ────────────────────────────────────────────────
function saveProducts() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
}

function setTheme(theme) {
  document.body.className = theme + "-theme";
  els.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

els.themeToggle?.addEventListener("click", () => {
  const current = document.body.classList.contains("dark-theme") ? "light" : "dark";
  setTheme(current);
});

// ────────────────────────────────────────────────
function showPage(page) {
  [els.loginSection, els.customerSection, els.adminSection]
    .forEach(el => el?.classList.add("hidden"));

  if (page === "login")    els.loginSection?.classList.remove("hidden");
  if (page === "customer") els.customerSection?.classList.remove("hidden");
  if (page === "admin")    els.adminSection?.classList.remove("hidden");
}

function updateUIAfterLogin() {
  if (!currentUser) {
    showPage("login");
    els.userGreeting.textContent = "";
    els.logoutBtn?.classList.add("hidden");
    els.manageBtn?.classList.add("hidden");
    return;
  }

  const isAdmin = currentUser.role === "admin";
  showPage(isAdmin ? "admin" : "customer");

  els.userGreeting.textContent = `خوش آمدید، ${currentUser.name}`;
  els.logoutBtn?.classList.remove("hidden");
  els.manageBtn?.classList.toggle("hidden", !isAdmin);

  if (!isAdmin) renderProducts();
  if (isAdmin)  renderAdminList();
}

// ────────────────────────────────────────────────
function renderProducts(filter = '') {
  if (!els.productGrid) return;
  els.productGrid.innerHTML = "";

  PRODUCTS
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      const imgSrc = p.image?.trim() 
        ? p.image 
        : `https://via.placeholder.com/400x340/6b21a8/ffffff?text=${encodeURIComponent(p.name.substring(0,18))}`;

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${imgSrc}" alt="${p.name}" 
               onerror="this.src='https://via.placeholder.com/400x400/6b21a8/ffffff?text=تصویر+ندارد'" 
               loading="lazy">
          <div class="card-image-overlay">
            <h3>${p.name}</h3>
            <button class="btn add-to-cart-btn" data-id="${p.id}">
              افزودن به سبد خرید
            </button>
          </div>
        </div>
        <div class="card-content">
          <div class="price">${p.price.toLocaleString("fa-IR")} تومان</div>
        </div>
      `;

      els.productGrid.appendChild(card);
    });

  // attach event listeners
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      addToCart(id);
    });
  });
}

// ────────────────────────────────────────────────
function login() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) {
    alert("نام کاربری و رمز عبور را وارد کنید");
    return;
  }

  if (username.toLowerCase() === "admin" && password === "1234") {
    currentUser = { role: "admin", name: "مدیر" };
  } else {
    currentUser = { role: "customer", name: username };
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUIAfterLogin();
}

els.logoutBtn?.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUIAfterLogin();
});

// ────────────────────────────────────────────────
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showNotification(`${product.name} به سبد خرید اضافه شد`);
}

function renderCart() {
  if (!els.cartItems) return;
  els.cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price.toLocaleString("fa-IR")}</td>
      <td>${item.quantity}</td>
      <td>${itemTotal.toLocaleString("fa-IR")}</td>
      <td><button class="remove-btn" data-index="${i}">حذف</button></td>
    `;
    els.cartItems.appendChild(tr);
  });

  els.cartTotal.textContent = `${total.toLocaleString("fa-IR")} تومان`;
}

els.cartItems?.addEventListener("click", e => {
  if (e.target.classList.contains("remove-btn")) {
    const index = parseInt(e.target.dataset.index);
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});

// ────────────────────────────────────────────────
function renderAdminList() {
  if (!els.adminProductList) return;
  els.adminProductList.innerHTML = "";

  PRODUCTS.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.name}</td><td>${p.price.toLocaleString("fa-IR")}</td>`;
    els.adminProductList.appendChild(tr);
  });
}

// ────────────────────────────────────────────────
function showNotification(message) {
  if (!els.notificationToast) return;
  els.notificationToast.textContent = message;
  els.notificationToast.classList.remove("hidden");
  els.notificationToast.classList.add("show");

  setTimeout(() => {
    els.notificationToast.classList.remove("show");
    setTimeout(() => els.notificationToast.classList.add("hidden"), 400);
  }, 3400);
}

// ────────────────────────────────────────────────
els.searchInput?.addEventListener('input', e => renderProducts(e.target.value));

els.backToTop?.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

window.addEventListener('scroll', () => {
  els.backToTop?.classList.toggle('show', window.scrollY > 300);
});

// ────────────────────────────────────────────────
// مدیریت محصولات (اضافه / حذف) — بدون تغییر اساسی
// فقط مطمئن شو که renderProducts و renderAdminList بعد از تغییر صدا زده شوند

// ... (بقیه توابع addProduct ، confirmDeleteProduct و ... همان قبلی هستند)

// ────────────────────────────────────────────────
window.addEventListener("load", () => {
  updateUIAfterLogin();

  // bind دکمه مدیریت
  els.manageBtn?.addEventListener("click", () => openModal("manage-modal"));
});
