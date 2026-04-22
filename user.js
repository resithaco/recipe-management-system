class RecipeApp {
  constructor() {
    this.activeCategory = "all";
    this.recipes = [];
    this.categories = [];
    this.cart = []; // مصفوفة لتخزين عناصر السلة

    this.init();
  }

  async init() {
    await this.loadCategories();
    await this.loadRecipes();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 1. تغيير التصنيفات
    const categoryRow = document.getElementById("categoryRow");
    categoryRow?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      this.activeCategory = btn.dataset.category;
      this.renderCategories();
      this.renderRecipes();
    });

    // 2. مسح الفلتر
    document.getElementById("clearFilterButton")?.addEventListener("click", () => {
      this.activeCategory = "all";
      this.renderCategories();
      this.renderRecipes();
    });

    // 3. إضافة وصفة جديدة عبر النموذج
    document.getElementById("recipeForm")?.addEventListener("submit", (e) => this.addRecipe(e));
  }

  // --- جلب البيانات ---
  loadRecipes = async () => {
    try {
      const localData = localStorage.getItem("recipes");
      if (localData) {
        this.recipes = JSON.parse(localData);
      } else {
        const response = await fetch("recipes.json");
        this.recipes = await response.json();
        this.saveToStorage();
      }
      this.renderRecipes();
    } catch (error) {
      console.error("Tarifler yüklenirken hata:", error);
    }
  };

  loadCategories = async () => {
    try {
      const response = await fetch("categories.json");
      this.categories = await response.json();
      this.renderCategories();
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  // --- إدارة البيانات ---
  saveToStorage() {
    localStorage.setItem("recipes", JSON.stringify(this.recipes));
  }

  addRecipe = (event) => {
    event.preventDefault();
    const name = document.getElementById("recipe").value;
    const ingredients = document.getElementById("ingredient").value;
    const img = document.getElementById("imageUrl").value;

    const newRecipe = {
      id: Date.now(),
      recipe: name,
      image: img || "https://via.placeholder.com/300",
      ingredients: ingredients.split(",").map(i => i.trim()),
      isFavorite: false,
      category: this.activeCategory === "all" ? "other" : this.activeCategory,
      rating: "5.0",
      ratingCount: "0",
      deliveryTime: "20-30 dk",
      minOrder: 40,
      menu: [] 
    };

    this.recipes.push(newRecipe);
    this.saveToStorage();
    this.renderRecipes();
    event.target.reset(); 
    alert("Yeni restoran/tarif başarıyla eklendi!");
  };

  toggleFavorite = (id) => {
    this.recipes = this.recipes.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    this.saveToStorage();
    this.renderRecipes();
  };

  // --- السلة (Cart Logic) ---
  addToCart = (resId, itemId) => {
    const restaurant = this.recipes.find(r => Number(r.id) === Number(resId));
    const item = restaurant?.menu?.find(m => Number(m.id) === Number(itemId));
    
    if (item) {
      this.cart.push({ ...item, restaurantName: restaurant.recipe });
      alert(`${item.name} sepete eklendi!`);
      console.log("Güncel Sepet:", this.cart);
    }
  };

  // --- العرض (Rendering) ---
  renderRecipes = () => {
    const resultDiv = document.getElementById("tariffs");
    if (!resultDiv) return;

    const filtered = this.activeCategory === "all"
      ? this.recipes
      : this.recipes.filter(r => r.category === this.activeCategory);

    resultDiv.innerHTML = filtered.map(item => `
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
          <div class="details">
            <span>${item.deliveryTime}</span> • <span>Min. ${item.minOrder} TL</span>
          </div>
        </div>
      </div>
    `).join("");
  };

  renderCategories = () => {
    const categoryRow = document.getElementById("categoryRow");
    if (!categoryRow) return;

    categoryRow.innerHTML = this.categories.map(cat => `
      <button class="category-chip ${cat.key === this.activeCategory ? 'active' : ''}" data-category="${cat.key}">
        <span class="category-icon">${cat.icon}</span>
        <strong>${cat.label}</strong>
      </button>
    `).join("");
  };

  // --- التنقل ---
  openRestaurant = (id) => {
    const restaurant = this.recipes.find(r => Number(r.id) === Number(id));
    if (!restaurant) return;

    document.getElementById("HomePage").style.display = "none";
    document.getElementById("restaurantPage").style.display = "block";

    document.getElementById("resName").innerText = restaurant.recipe;
    document.getElementById("resImage").src = restaurant.image;

    const menuDiv = document.getElementById("menu");
    if (restaurant.menu && restaurant.menu.length > 0) {
      menuDiv.innerHTML = restaurant.menu.map(item => `
        <div class="menu-item">
          <img src="${item.image}" onerror="this.src='https://via.placeholder.com/150'">
          <div class="menu-text">
            <h4>${item.name}</h4>
            <p>₺${item.price}</p>
          </div>
          <button onclick="app.addToCart(${restaurant.id}, ${item.id})">+</button>
        </div>
      `).join("");
    } else {
      menuDiv.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Menü henüz eklenmemiş.</p>";
    }
    window.scrollTo(0, 0);
  };

  goBack = () => {
    document.getElementById("HomePage").style.display = "block";
    document.getElementById("restaurantPage").style.display = "none";
  };
}

const app = new RecipeApp();