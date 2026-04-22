class RecipeApp {
  constructor() {
    this.activeCategory = "all";
    this.recipes = [];
    this.categories = []; // تخزين التصنيفات لتقليل طلبات الشبكة

    this.init();
  }

  // دالة لتهيئة التطبيق وترتيب استدعاء البيانات
  async init() {
    await this.loadCategories();
    await this.loadRecipes();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const categoryRow = document.getElementById("categoryRow");
    categoryRow?.addEventListener("click", (e) => {
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
    
    // ربط نموذج إضافة الوصفة (تأكد من وجود id="recipeForm" في HTML)
    document.getElementById("recipeForm")?.addEventListener("submit", (e) => this.addRecipe(e));
  }

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
      console.error("Error loading recipes:", error);
    }
  };

  loadCategories = async () => {
    try {
      const response = await fetch("categories.json");
      this.categories = await response.json();
      this.renderCategories();
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  addRecipe = (event) => {
    event.preventDefault();
    const recipeInput = document.getElementById("recipe");
    const ingredientInput = document.getElementById("ingredient");
    const imageUrlInput = document.getElementById("imageUrl");

    if (!recipeInput.value || !ingredientInput.value || !imageUrlInput.value) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    const newRecipe = {
      id: Date.now(),
      recipe: recipeInput.value,
      image: imageUrlInput.value,
      ingredients: ingredientInput.value.split(",").map(i => i.trim()),
      isFavorite: false,
      category: this.activeCategory === "all" ? "other" : this.activeCategory,
      // قيم افتراضية للعناصر الجديدة
      rating: "5.0",
      ratingCount: 0,
      deliveryTime: "20-30 dk",
      priceLevel: "₺",
      minOrder: 0
    };

    this.recipes.push(newRecipe);
    this.saveToStorage();
    this.renderRecipes();
    
    // تفريغ الحقول
    event.target.reset(); 
    alert("Tarif başarıyla eklendi!");
  };

  renderRecipes = () => {
    const resultDiv = document.getElementById("tariffs");
    if (!resultDiv) return;

    const filtered = this.activeCategory === "all"
      ? this.recipes
      : this.recipes.filter(r => r.category === this.activeCategory);

    resultDiv.innerHTML = filtered.map(item => `
      <div onclick="app.openRestaurant(${item.id})" class="food-card">
        <div class="img-container">
          <img src="${item.image}" class="card-img" alt="${item.recipe}">
          <div class="fav-icon" onclick="event.stopPropagation(); app.toggleFavorite(${item.id})">
            ${item.isFavorite ? "❤️" : "🤍"}
          </div>
        </div>
        <div class="food-info">
          <h3>${item.recipe}</h3>
          <div class="rating">
            ⭐ ${item.rating || "0.0"} <span>(${item.ratingCount || 0})</span>
          </div>
          <div class="details">
            <span>${item.deliveryTime || ""}</span> • 
            <span>${item.priceLevel || ""}</span> •
            <span>Min. ${item.minOrder || 0} TL</span>
          </div>
          <div class="tags">
            ${item.isFreeDelivery ? `<span class="free">Ücretsiz</span>` : ""}
            ${item.discount ? `<span class="discount">%${item.discount}</span>` : ""}
            ${item.plus ? `<span class="plus">+${item.plus}</span>` : ""}
          </div>
        </div>
      </div>
    `).join("");
  };

  toggleFavorite = (id) => {
    this.recipes = this.recipes.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    this.saveToStorage();
    this.renderRecipes();
  };

  openRestaurant = (id) => {
    const restaurant = this.recipes.find(r => r.id === id);
    if (!restaurant) return;

    document.getElementById("HomePage").style.display = "none";
    document.getElementById("restaurantPage").style.display = "block";

    document.getElementById("resName").innerText = restaurant.recipe;
    document.getElementById("resImage").src = restaurant.image;

    const menuDiv = document.getElementById("menu");
    if (restaurant.menu && restaurant.menu.length > 0) {
      menuDiv.innerHTML = restaurant.menu.map(item => `
        <div class="menu-item">
          <img src="${item.image}" alt="${item.name}">
          <h4>${item.name}</h4>
          <p>₺${item.price}</p>
          <button onclick="app.addToCart(${id}, ${item.id})">+</button>
        </div>
      `).join("");
    } else {
      menuDiv.innerHTML = "<p>Menü henüz eklenmemiş.</p>";
    }
  };

  goBack = () => {
    document.getElementById("HomePage").style.display = "block";
    document.getElementById("restaurantPage").style.display = "none";
  };

  renderCategories = () => {
    const categoryRow = document.getElementById("categoryRow");
    if (!categoryRow || this.categories.length === 0) return;

    categoryRow.innerHTML = this.categories.map((category) => `
      <button 
        class="category-chip ripple ${category.key === this.activeCategory ? "active" : ""}" 
        type="button" 
        data-category="${category.key}"
      >
        <span class="category-icon">${category.icon}</span>
        <strong>${category.label}</strong>
      </button>
    `).join("");
  };

  saveToStorage() {
    localStorage.setItem("recipes", JSON.stringify(this.recipes));
  }
}

// تشغيل التطبيق
const app = new RecipeApp();