class RecipeApp {
  constructor() {
    this.activeCategory = "all";
    this.recipes = [];
    this.categories = [];
    this.cart = []; // إضافة مصفوفة للسلة

    this.init();
  }

  async init() {
    await this.loadCategories();
    await this.loadRecipes();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 1. التعامل مع الضغط على التصنيفات
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

    // 3. نموذج إضافة وصفة
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
      console.error("Tarifler yüklenirken hata oluştu:", error);
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

  // --- العمليات الأساسية ---

  addRecipe = (event) => {
    event.preventDefault();
    const recipeInput = document.getElementById("recipe");
    const ingredientInput = document.getElementById("ingredient");
    const imageUrlInput = document.getElementById("imageUrl");

    const newRecipe = {
      id: Date.now(),
      recipe: recipeInput.value,
      image: imageUrlInput.value || "https://via.placeholder.com/300",
      ingredients: ingredientInput.value.split(",").map(i => i.trim()),
      isFavorite: false,
      category: this.activeCategory === "all" ? "other" : this.activeCategory,
      rating: "5.0",
      ratingCount: 0,
      deliveryTime: "20-30 dk",
      priceLevel: "₺",
      minOrder: 40,
      menu: [] // قائمة طعام فارغة افتراضياً للوصفات الجديدة
    };

    this.recipes.push(newRecipe);
    this.saveToStorage();
    this.renderRecipes();
    event.target.reset(); 
    alert("Yeni tarif eklendi!");
  };

  toggleFavorite = (id) => {
    this.recipes = this.recipes.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    this.saveToStorage();
    this.renderRecipes();
  };

  // --- السلة (Cart Logic) ---
  addToCart = (restaurantId, itemId) => {
    const restaurant = this.recipes.find(r => r.id === restaurantId);
    const item = restaurant?.menu.find(m => m.id === itemId);
    
    if (item) {
      this.cart.push(item);
      alert(`${item.name} sepete eklendi!`);
      console.log("Sepetiniz:", this.cart);
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

  // --- التنقل (Navigation) ---

  openRestaurant = (id) => {
  // تحويل id إلى رقم لضمان المطابقة مع JSON
  const restaurant = this.recipes.find(r => Number(r.id) === Number(id));
  
  if (!restaurant) {
    console.error("Restaurant not found for ID:", id);
    return;
  }

  // إظهار وإخفاء الصفحات
  document.getElementById("HomePage").style.display = "none";
  document.getElementById("restaurantPage").style.display = "block";

  // تعبئة البيانات الأساسية
  document.getElementById("resName").innerText = restaurant.recipe;
  document.getElementById("resImage").src = restaurant.image;

  const menuDiv = document.getElementById("menu");
  
  // التأكد من وجود المنيو وأنه مصفوفة
  if (restaurant.menu && Array.isArray(restaurant.menu) && restaurant.menu.length > 0) {
    menuDiv.innerHTML = restaurant.menu.map(item => `
      <div class="menu-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="menu-text">
          <h4>${item.name}</h4>
          <p>₺${item.price}</p>
        </div>
        <button onclick="app.addToCart(${restaurant.id}, ${item.id})">+</button>
      </div>
    `).join("");
  } else {
    menuDiv.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <p>Bu restoranın menüsü henüz eklenmemiş.</p>
      </div>
    `;
  }
  
  window.scrollTo(0, 0);
};

  goBack = () => {
    document.getElementById("HomePage").style.display = "block";
    document.getElementById("restaurantPage").style.display = "none";
  };

  saveToStorage() {
    localStorage.setItem("recipes", JSON.stringify(this.recipes));
  }
}

const app = new RecipeApp();