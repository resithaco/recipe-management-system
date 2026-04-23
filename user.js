class RecipeApp {
  constructor() {
    this.activeCategory = "all";
    this.recipes = [];
    this.categories = [];
    this.cart = [];
    this.userData = {};

    this.init();
  }

  async init() {
    this.loadUserData(); 
    await this.loadCategories();
    await this.loadRecipes();
    this.setupEventListeners();
    this.getLocation();
  }

  setupEventListeners() {
    // 1. البحث العلوي (Input)
    document.getElementById("searchInput")?.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = this.recipes.filter(r => 
          r.recipe.toLowerCase().includes(term) || r.category.toLowerCase().includes(term)
      );
      this.renderFilteredRecipes(filtered);
    });

    // 2. الفلترة حسب التصنيفات
    document.getElementById("categoryRow")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      this.activeCategory = btn.dataset.category;
      this.renderCategories();
      this.renderRecipes();
    });

    // 3. زر مسح الفلتر (Filtreyi Temizle)
    document.getElementById("clearFilterButton")?.addEventListener("click", () => {
      this.activeCategory = "all";
      const searchInp = document.getElementById("searchInput");
      if (searchInp) searchInp.value = ""; 
      this.renderCategories();
      this.renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 4. أزرار التنقل السفلية (إصلاح تداخل الصفحات)
    document.querySelector('[data-nav="home"]')?.addEventListener("click", () => this.showPage("HomePage"));
    document.querySelector('[data-nav="orders"]')?.addEventListener("click", () => this.showPage("cartPage"));
    document.querySelector('[data-nav="profile"]')?.addEventListener("click", () => this.showPage("profilePage"));
    
    // تفعيل زر "Ara" السفلي للتركيز على حقل البحث
    document.querySelector('[data-nav="search"]')?.addEventListener("click", () => {
        this.showPage("HomePage");
        const inp = document.getElementById("searchInput");
        if (inp) inp.focus();
    });

    // 5. حفظ البروفايل
    document.getElementById("profileForm")?.addEventListener("submit", (e) => this.saveProfile(e));
  }

  // --- دالة التنقل المركزية (تخفي كل الصفحات ما عدا المطلوبة) ---
  showPage = (pageId) => {
    const pages = ["HomePage", "restaurantPage", "cartPage", "profilePage"];
    pages.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = (id === pageId) ? "block" : "none";
      }
    });
    if (pageId === "profilePage") this.loadUserData();
    if (pageId === "cartPage") this.updateCartUI();
    window.scrollTo(0, 0);
  };

  // --- الموقع الجغرافي الدقيق (الشارع + رقم المنزل) ---
  getLocation = () => {
    const locText = document.getElementById("locationText");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`);
          const data = await res.json();
          const a = data.address;
          const neighborhood = a.suburb || a.neighbourhood || "";
          const street = a.road || a.street || "";
          const house = a.house_number ? " No:" + a.house_number : "";
          locText.textContent = `${neighborhood} ${street}${house}`.trim() || "Konum Alındı";
        } catch (e) { locText.textContent = "Adres alınamadı"; }
      }, null, { enableHighAccuracy: true });
    }
  };

  // --- نظام المستخدم (الربط مع صفحة التسجيل) ---
  loadUserData = () => {
    const user = localStorage.getItem("username");
    const all = JSON.parse(localStorage.getItem("users")) || {};
    if (user && all[user]) {
      this.userData = { username: user, ...all[user] };
    } else {
      this.userData = { name: "Misafir", email: "" };
    }
    this.updateProfileUI();
  };

  saveProfile = (e) => {
    e.preventDefault();
    const user = localStorage.getItem("username");
    const all = JSON.parse(localStorage.getItem("users")) || {};
    if (!user) return;

    all[user] = {
      ...all[user],
      name: document.getElementById("profileName").value,
      email: document.getElementById("profileEmail").value,
      phone: document.getElementById("profilePhone").value,
      password: document.getElementById("profilePass").value || all[user].password
    };
    localStorage.setItem("users", JSON.stringify(all));
    this.loadUserData();
    alert("Profil Güncellendi! ✅");
  };

  updateProfileUI = () => {
    const nameShow = document.getElementById("displayUserName");
    if (nameShow) {
      nameShow.innerText = this.userData.name || this.userData.username || "Misafir";
      document.getElementById("displayUserEmail").innerText = this.userData.email || "";
      document.getElementById("profileName").value = this.userData.name || "";
      document.getElementById("profileEmail").value = this.userData.email || "";
      document.getElementById("profilePhone").value = this.userData.phone || "";
    }
  };

  // --- نظام السلة (Quantity Control) ---
  addToCart = (resId, itemId) => {
    const res = this.recipes.find(r => r.id == resId);
    const item = res.menu.find(m => m.id == itemId);
    const exist = this.cart.find(c => c.id === item.id);
    if (exist) exist.quantity += 1;
    else this.cart.push({ ...item, quantity: 1 });
    this.updateCartUI();
  };

  updateQuantity = (idx, delta) => {
    this.cart[idx].quantity += delta;
    if (this.cart[idx].quantity < 1) this.cart.splice(idx, 1);
    this.updateCartUI();
  };

  updateCartUI = () => {
    const totalQty = this.cart.reduce((s, i) => s + i.quantity, 0);
    const b1 = document.getElementById("cartCount");
    const b2 = document.getElementById("bottomCartBadge");
    if (b1) b1.innerText = totalQty;
    if (b2) b2.innerText = totalQty;

    const itemsDiv = document.getElementById("cartItems");
    if (itemsDiv) {
      itemsDiv.innerHTML = this.cart.length === 0 ? "<p style='text-align:center;'>Sepetiniz boş.</p>" : this.cart.map((item, index) => `
        <div class="cart-item">
          <div><h4>${item.name}</h4><small>₺${item.price}</small></div>
          <div class="cart-controls">
            <button onclick="app.updateQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="app.updateQuantity(${index}, 1)">+</button>
          </div>
        </div>
      `).join("");
    }
    const total = this.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const priceEl = document.getElementById("totalPrice");
    if (priceEl) priceEl.innerText = `${total} TL`;
  };

  // --- جلب وعرض المطاعم ---
  loadRecipes = async () => {
    const local = localStorage.getItem("recipes");
    if (local) this.recipes = JSON.parse(local);
    else {
      const res = await fetch("recipes.json");
      this.recipes = await res.json();
      localStorage.setItem("recipes", JSON.stringify(this.recipes));
    }
    this.renderRecipes();
  };

  loadCategories = async () => {
    const res = await fetch("categories.json");
    this.categories = await res.json();
    this.renderCategories();
  };

  renderRecipes = () => {
    const list = this.activeCategory === "all" ? this.recipes : this.recipes.filter(r => r.category === this.activeCategory);
    this.renderFilteredRecipes(list);
  };

  renderFilteredRecipes = (list) => {
    const div = document.getElementById("tariffs");
    if (!div) return;
    div.innerHTML = list.map(item => `
      <div class="food-card" onclick="app.openRestaurant(${item.id})">
        <div class="img-container">
          <img src="${item.image}" class="card-img">
          <div class="fav-icon" onclick="event.stopPropagation(); app.toggleFavorite(${item.id})">
            ${item.isFavorite ? "❤️" : "🤍"}
          </div>
        </div>
        <div class="food-info">
          <h3>${item.recipe}</h3>
          <div class="rating">⭐ ${item.rating}</div>
        </div>
      </div>
    `).join("");
  };

  renderCategories = () => {
    const row = document.getElementById("categoryRow");
    if (row) row.innerHTML = this.categories.map(cat => `
      <button class="category-chip ${cat.key === this.activeCategory ? 'active' : ''}" data-category="${cat.key}">
        <strong>${cat.label}</strong>
      </button>
    `).join("");
  };

  openRestaurant = (id) => {
    const res = this.recipes.find(r => r.id == id);
    this.showPage("restaurantPage");
    document.getElementById("resName").innerText = res.recipe;
    document.getElementById("resImage").src = res.image;
    document.getElementById("menu").innerHTML = res.menu.map(item => `
      <div class="menu-item">
        <div class="menu-text"><h4>${item.name}</h4><p>₺${item.price}</p></div>
        <button onclick="app.addToCart(${res.id}, ${item.id})">+</button>
      </div>
    `).join("");
  };

  // دوال الرجوع (تستخدم نظام التنقل الموحد)
  goBack = () => this.showPage("HomePage");
  closeCart = () => this.showPage("HomePage");
  closeProfile = () => this.showPage("HomePage");

  logOut = () => {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      localStorage.removeItem("username");
      window.location.href = "login.html";
    }
  };

  toggleFavorite = (id) => {
    this.recipes = this.recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
    localStorage.setItem("recipes", JSON.stringify(this.recipes));
    this.renderRecipes();
  };

  checkout = () => {
    if (this.cart.length === 0) return;
    alert("Siparişiniz alındı! 🛵");
    this.cart = [];
    this.updateCartUI();
    this.showPage("HomePage");
  };
}

const app = new RecipeApp();