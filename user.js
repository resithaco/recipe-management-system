class RecipeApp {
  constructor() {
    this.activeCategory = "all";
    this.recipes = [];
    this.categories = [];
    this.cart = [];
    this.userData = {}; // بيانات المستخدم الحالي

    this.init();
  }

  async init() {
    this.loadUserData(); // جلب بيانات المستخدم المسجل فوراً
    await this.loadCategories();
    await this.loadRecipes();
    this.setupEventListeners();
    this.getLocation(); // جلب الموقع الجغرافي
  }

  setupEventListeners() {
    // 1. الفلترة والبحث
    document.getElementById("categoryRow")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      this.activeCategory = btn.dataset.category;
      this.renderCategories();
      this.renderRecipes();
    });

    document.getElementById("clearFilterButton")?.addEventListener("click", () => {
      this.activeCategory = "all";
      this.renderCategories();
      this.renderRecipes();
    });

    document.getElementById("searchInput")?.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = this.recipes.filter(r => 
          r.recipe.toLowerCase().includes(term) || 
          r.category.toLowerCase().includes(term)
      );
      this.renderFilteredRecipes(filtered);
    });

    // 2. التنقل (Bottom Nav)
    document.querySelector('[data-nav="orders"]')?.addEventListener("click", () => this.openCart());
    document.querySelector('[data-nav="home"]')?.addEventListener("click", () => this.closeCart());
    document.querySelector('[data-nav="profile"]')?.addEventListener("click", () => this.openProfile());

    // 3. البروفايل
    document.getElementById("profileForm")?.addEventListener("submit", (e) => this.saveProfile(e));
  }

  // --- نظام المستخدم (Profile Logic) ---
  loadUserData = () => {
    const currentUsername = localStorage.getItem("username");
    const allUsers = JSON.parse(localStorage.getItem("users")) || {};

    if (currentUsername && allUsers[currentUsername]) {
      const data = allUsers[currentUsername];
      this.userData = {
        username: currentUsername,
        name: data.name || currentUsername,
        email: data.email || "",
        phone: data.phone || "",
        password: data.password || "",
        orderCount: data.orderCount || 0
      };
    } else {
      this.userData = { name: "Misafir", email: "", phone: "", orderCount: 0 };
    }
    this.updateProfileUI();
  };

  saveProfile = (e) => {
    e.preventDefault();
    const currentUsername = localStorage.getItem("username");
    const allUsers = JSON.parse(localStorage.getItem("users")) || {};

    if (!currentUsername || !allUsers[currentUsername]) return alert("Oturum bulunamadı!");

    allUsers[currentUsername] = {
      ...allUsers[currentUsername],
      name: document.getElementById("profileName").value,
      email: document.getElementById("profileEmail").value,
      phone: document.getElementById("profilePhone").value,
      password: document.getElementById("profilePass").value || allUsers[currentUsername].password
    };

    localStorage.setItem("users", JSON.stringify(allUsers));
    this.userData = { ...this.userData, ...allUsers[currentUsername] };
    this.updateProfileUI();
    alert("Profil güncellendi! ✅");
  };

  updateProfileUI = () => {
    if (document.getElementById("displayUserName")) {
      document.getElementById("displayUserName").innerText = this.userData.name;
      document.getElementById("displayUserEmail").innerText = this.userData.email;
      document.getElementById("statOrderCount").innerText = this.userData.orderCount;
      document.getElementById("profileName").value = this.userData.name;
      document.getElementById("profileEmail").value = this.userData.email;
      document.getElementById("profilePhone").value = this.userData.phone;
    }
  };


  // --- نظام السلة (Cart Logic) ---
  addToCart = (resId, itemId) => {
    const res = this.recipes.find(r => Number(r.id) === Number(resId));
    const item = res?.menu?.find(m => Number(m.id) === Number(itemId));
    if (item) {
      const existing = this.cart.find(c => c.id === item.id);
      if (existing) existing.quantity += 1;
      else this.cart.push({ ...item, quantity: 1, resId });
      this.updateCartUI();
    }
  };

  updateQuantity = (index, delta) => {
    this.cart[index].quantity += delta;
    if (this.cart[index].quantity < 1) this.cart.splice(index, 1);
    this.updateCartUI();
  };

  updateCartUI = () => {
    const totalQty = this.cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById("cartCount").innerText = totalQty;
    document.getElementById("bottomCartBadge").innerText = totalQty;

    const cartItemsDiv = document.getElementById("cartItems");
    if (this.cart.length === 0) {
      cartItemsDiv.innerHTML = "<p style='text-align:center;'>Sepetiniz boş.</p>";
    } else {
      cartItemsDiv.innerHTML = this.cart.map((item, index) => `
        <div class="cart-item">
          <div class="cart-item-info"><h4>${item.name}</h4><small>₺${item.price}</small></div>
          <div class="cart-controls">
            <button onclick="app.updateQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="app.updateQuantity(${index}, 1)">+</button>
            <button class="cart-delete-btn" onclick="app.removeFromCart(${index})">🗑️</button>
          </div>
        </div>
      `).join("");
    }
    const total = this.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    document.getElementById("totalPrice").innerText = `${total} TL`;
  };

  removeFromCart = (i) => { this.cart.splice(i, 1); this.updateCartUI(); };

  // --- جلب بيانات المطاعم ---
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

  // --- العرض والتنقل ---
  renderRecipes = () => {
    const filtered = this.activeCategory === "all" ? this.recipes : this.recipes.filter(r => r.category === this.activeCategory);
    this.renderFilteredRecipes(filtered);
  };

  renderFilteredRecipes = (list) => {
    const div = document.getElementById("tariffs");
    div.innerHTML = list.map(item => `
      <div class="food-card" onclick="app.openRestaurant(${item.id})">
        <div class="img-container">
          <img src="${item.image}" class="card-img" loading="lazy">
          <div class="fav-icon" onclick="event.stopPropagation(); app.toggleFavorite(${item.id})">
            ${item.isFavorite ? "❤️" : "🤍"}
          </div>
        </div>
        <div class="food-info">
          <h3>${item.recipe}</h3>
          <div class="rating">⭐ ${item.rating} <span>(${item.ratingCount})</span></div>
          <div class="details"><span>${item.deliveryTime}</span> • <span>Min. ${item.minOrder} TL</span></div>
        </div>
      </div>
    `).join("");
  };

  renderCategories = () => {
    document.getElementById("categoryRow").innerHTML = this.categories.map(cat => `
      <button class="category-chip ${cat.key === this.activeCategory ? 'active' : ''}" data-category="${cat.key}">
        <span class="category-icon">${cat.icon}</span><strong>${cat.label}</strong>
      </button>
    `).join("");
  };

  openRestaurant = (id) => {
    const res = this.recipes.find(r => Number(r.id) === Number(id));
    document.getElementById("HomePage").style.display = "none";
    document.getElementById("restaurantPage").style.display = "block";
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("resName").innerText = res.recipe;
    document.getElementById("resImage").src = res.image;
    document.getElementById("menu").innerHTML = res.menu.map(item => `
      <div class="menu-item">
        <img src="${item.image}">
        <div class="menu-text"><h4>${item.name}</h4><p>₺${item.price}</p></div>
        <button onclick="app.addToCart(${res.id}, ${item.id})">+</button>
      </div>
    `).join("");
    window.scrollTo(0,0);
  };

  openProfile = () => {
    document.getElementById("HomePage").style.display = "none";
    document.getElementById("restaurantPage").style.display = "none";
    document.getElementById("cartPage").style.display = "none";
    document.getElementById("profilePage").style.display = "block";
  };

  closeProfile = () => { document.getElementById("profilePage").style.display = "none"; document.getElementById("HomePage").style.display = "block"; };
  openCart = () => { document.getElementById("HomePage").style.display = "none"; document.getElementById("restaurantPage").style.display = "none"; document.getElementById("cartPage").style.display = "block"; };
  closeCart = () => { document.getElementById("cartPage").style.display = "none"; document.getElementById("HomePage").style.display = "block"; };
  goBack = () => { document.getElementById("restaurantPage").style.display = "none"; document.getElementById("HomePage").style.display = "block"; };

  checkout = () => {
    if (this.cart.length === 0) return;
    alert("Siparişiniz alındı! 🛵");
    this.cart = [];
    this.updateCartUI();
    this.closeCart();
  };

  toggleFavorite = (id) => {
    this.recipes = this.recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
    localStorage.setItem("recipes", JSON.stringify(this.recipes));
    this.renderRecipes();
  };
}

const app = new RecipeApp();