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

function saveProducts() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
}

function setTheme(theme) {
  document.body.className = theme + "-theme";
  if (els.themeToggle) els.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

if (els.themeToggle) {
  els.themeToggle.addEventListener("click", () => {
    const current = document.body.classList.contains("dark-theme") ? "light" : "dark";
    setTheme(current);
  });
}

const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

function showPage(page) {
  els.loginSection?.classList.add("hidden");
  els.customerSection?.classList.add("hidden");
  els.adminSection?.classList.add("hidden");

  if (page === "customer") els.customerSection?.classList.remove("hidden");
  if (page === "admin") els.adminSection?.classList.remove("hidden");
  if (page === "login") els.loginSection?.classList.remove("hidden");
}

function updateUIAfterLogin() {
  if (!currentUser) {
    showPage("login");
    if (els.userGreeting) els.userGreeting.textContent = "";
    if (els.logoutBtn) els.logoutBtn.classList.add("hidden");
    if (els.manageBtn) els.manageBtn.classList.add("hidden");
    return;
  }

  const isAdmin = currentUser.role === "admin";
  showPage(isAdmin ? "admin" : "customer");

  if (els.userGreeting) els.userGreeting.textContent = `خوش آمدید، ${currentUser.name}`;
  if (els.logoutBtn) els.logoutBtn.classList.remove("hidden");
  if (els.manageBtn) els.manageBtn.classList.toggle("hidden", !isAdmin);
function renderProducts(filter = '') {
  if (!els.productGrid) return;
  els.productGrid.innerHTML = "";

  PRODUCTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      // اگر عکس نبود، placeholder ساده بذار
      const imgSrc = p.image && p.image.trim() !== "" 
        ? p.image 
        : "https://via.placeholder.com/400x340/6b21a8/ffffff?text=" + encodeURIComponent(p.name.substring(0, 20));

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${imgSrc}" alt="${p.name}" loading="lazy">
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

  // دوباره listenerها رو attach کن
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.getAttribute('data-id'));
      addToCart(id);
    });
  });
}
}

function login() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) return alert("نام کاربری و رمز را وارد کنید");

  if (username.toLowerCase() === "admin" && password === "1234") {
    currentUser = { role: "admin", name: "مدیر" };
  } else {
    currentUser = { role: "customer", name: username };
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUIAfterLogin();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUIAfterLogin();
}

function renderProducts(filter = '') {
  if (!els.productGrid) return;
  els.productGrid.innerHTML = "";

  PRODUCTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${p.image}" alt="${p.name}" 
               onerror="this.src='https://via.placeholder.com/400x400/6b21a8/ffffff?text=${encodeURIComponent(p.name)}'" 
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

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

if (els.searchInput) {
  els.searchInput.addEventListener('input', e => renderProducts(e.target.value));
}

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

  const toast = document.getElementById("add-to-cart-toast");
  if (toast) {
    toast.textContent = `${product.name} به سبد خرید شما اضافه شد`;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 600);
    }, 4000);
  }
}

function renderCart() {
  if (!els.cartItems) return;
  els.cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price.toLocaleString("fa-IR")}</td>
      <td>${item.quantity}</td>
      <td>${itemTotal.toLocaleString("fa-IR")}</td>
      <td>
        <button class="remove-btn" onclick="removeFromCart(${index})">
          حذف
        </button>
      </td>
    `;
    els.cartItems.appendChild(tr);
  });

  if (els.cartTotal) els.cartTotal.textContent = `${total.toLocaleString("fa-IR")} تومان`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderAdminList() {
  if (!els.adminProductList) return;
  els.adminProductList.innerHTML = "";

  PRODUCTS.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.price.toLocaleString("fa-IR")}</td>
    `;
    els.adminProductList.appendChild(tr);
  });
}

function openManageModal() {
  const modal = document.getElementById("manage-modal");
  if (modal) modal.classList.add("show");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("show");
}

function openAddProductModal() {
  closeModal("manage-modal");
  const modal = document.getElementById("add-product-modal");
  if (modal) modal.classList.add("show");
}

function closeAddProductModal() {
  closeModal("add-product-modal");
}

function addProduct() {
  const name = document.getElementById("new-name").value.trim();
  const image = document.getElementById("new-image").value.trim();
  const price = parseInt(document.getElementById("new-price").value);

  if (!name || !image || isNaN(price)) {
    alert("همه فیلدها اجباری هستند!");
    return;
  }

  if (!name.startsWith("روسری") && !name.startsWith("شال")) {
    alert("نام محصول باید با 'روسری' یا 'شال' شروع شود!");
    return;
  }

  if (price < 200000 || price > 5000000) {
    alert("قیمت باید بین ۲۰۰,۰۰۰ تا ۵,۰۰۰,۰۰۰ تومان باشد!");
    return;
  }

  const newId = PRODUCTS.length ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
  PRODUCTS.push({ id: newId, name, price, image });

  saveProducts();
  closeAddProductModal();
  renderProducts();
  if (currentUser?.role === "admin") renderAdminList();

  showNotification(`${name} با موفقیت اضافه شد`);
}

function openDeleteProductModal() {
  closeModal("manage-modal");
  const list = document.getElementById("delete-list");
  if (!list) return;
  list.innerHTML = "";

  PRODUCTS.forEach(p => {
    const item = document.createElement("div");
    item.className = "delete-item";
    item.innerHTML = `
      <span>${p.name} - ${p.price.toLocaleString("fa-IR")} تومان</span>
      <button onclick="confirmDelete(${p.id})">حذف</button>
    `;
    list.appendChild(item);
  });

  const modal = document.getElementById("delete-product-modal");
  if (modal) modal.classList.add("show");
}

function closeDeleteProductModal() {
  closeModal("delete-product-modal");
}

let deleteIdToRemove = null;

function confirmDelete(id) {
  deleteIdToRemove = id;
  const product = PRODUCTS.find(p => p.id === id);
  document.getElementById("delete-product-name").textContent = product.name;
  const modal = document.getElementById("confirm-delete-modal");
  if (modal) modal.classList.add("show");
}

function closeConfirmDeleteModal() {
  closeModal("confirm-delete-modal");
  deleteIdToRemove = null;
}

function confirmDeleteProduct() {
  if (!deleteIdToRemove) return;

  const deletedProduct = PRODUCTS.find(p => p.id === deleteIdToRemove);
  PRODUCTS = PRODUCTS.filter(p => p.id !== deleteIdToRemove);
  saveProducts();

  closeConfirmDeleteModal();
  closeDeleteProductModal();

  renderProducts();
  if (currentUser?.role === "admin") renderAdminList();

  showNotification(`${deletedProduct.name} حذف شد`);
  deleteIdToRemove = null;
}

function showNotification(message) {
  const toast = els.notificationToast;
  if (toast) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 600);
    }, 4000);
  }
}

if (els.searchInput) {
  els.searchInput.addEventListener('input', e => renderProducts(e.target.value));
}

if (els.backToTop) {
  window.addEventListener('scroll', () => {
    els.backToTop.classList.toggle('show', window.scrollY > 300);
  });

  els.backToTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
}

// Bind دکمه مدیریت
window.addEventListener("load", function() {
  const manageBtn = document.getElementById("manage-products-btn");
  if (manageBtn) {
    manageBtn.addEventListener("click", openManageModal);
  }
});

window.addEventListener("load", updateUIAfterLogin);
// باز و بسته کردن modalها
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
  }
}

// مدیریت کلیک دکمه‌های داخل modal مدیریت
window.addEventListener("load", function() {
  // دکمه مدیریت محصولات (قبلاً bind شده بود، اما مطمئن می‌شیم)
  const manageBtn = document.getElementById("manage-products-btn");
  if (manageBtn) {
    manageBtn.addEventListener("click", () => openModal("manage-modal"));
  }

  // دکمه‌های داخل modal مدیریت
  const addBtn = document.querySelector("#manage-modal .add-btn");
  const deleteBtn = document.querySelector("#manage-modal .delete-btn");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      closeModal("manage-modal");
      openModal("add-product-modal");
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      closeModal("manage-modal");
      openModal("delete-product-modal");
      // لود لیست حذف
      const list = document.getElementById("delete-list");
      if (list) {
        list.innerHTML = "";
        PRODUCTS.forEach(p => {
          const item = document.createElement("div");
          item.className = "delete-item";
          item.innerHTML = `
            <span>${p.name} - ${p.price.toLocaleString("fa-IR")} تومان</span>
            <button onclick="confirmDelete(${p.id})">حذف</button>
          `;
          list.appendChild(item);
        });
      }
    });
  }

  // بستن modalهای اضافه و حذف
  document.querySelector("#add-product-modal .close-modal")?.addEventListener("click", () => closeModal("add-product-modal"));
  document.querySelector("#delete-product-modal .close-modal")?.addEventListener("click", () => closeModal("delete-product-modal"));
  document.querySelector("#confirm-delete-modal .close-modal")?.addEventListener("click", () => closeModal("confirm-delete-modal"));
});