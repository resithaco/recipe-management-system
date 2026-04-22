class RecipeApp {

  constructor() {
    this.activeCategory = "all";
    this.renderCategories();
    this.recipes = [];
    this.loadRecipes();
  }

  loadRecipes = async () => {

    const response = await fetch("recipes.json");

    const data = await response.json();

    this.recipes = data;

    this.renderRecipes();
  }

  addRecipe = (event) => {
    event.preventDefault();
    const recipeInput = document.getElementById("recipe");
    const ingredientInput = document.getElementById("ingredient");
    const imageUrlInput = document.getElementById("imageUrl");

    const recipeName = recipeInput.value;
    const ingredients = ingredientInput.value;
    const imageUrl = imageUrlInput.value;

    if (!recipeName || !ingredients || !imageUrl) {
      alert("Lütfen tarifin adını ve malzemelerini girin!");
      return;
    }

    const newRecipe = {
      id: Date.now(),
      recipe: recipeName,
      image: imageUrl,
      ingredients: ingredients.split(","),
      isFavorite: false
    };

    this.recipes.push(newRecipe);

    localStorage.setItem("recipes", JSON.stringify(this.recipes));
    this.renderRecipes();
    recipeInput.value = "";
    ingredientInput.value = "";
    imageUrlInput.value="";

    alert("Tarif eklendi!");
  }

  renderRecipes = () => {
  const resultDiv = document.getElementById("tariffs");

  if (!resultDiv) return;

  resultDiv.innerHTML = "";

  this.recipes.forEach(({ id,
    recipe,
    isFavorite,
    image,
    rating,
    ratingCount,
    deliveryTime,
    priceLevel,
    minOrder,
    isFreeDelivery,
    discount,
    plus
  }) => {

    resultDiv.innerHTML += `
    <div onclick="app.openRestaurant(${id})" class="food-card">

      <div class="img-container">
        <img src="${image}" class="card-img">

        <div class="fav-icon" onclick="app.toggleFavorite(${id})">
          ${isFavorite ? "❤️" : "🤍"}
        </div>

      </div>

      <div class="food-info">
        <h3>${recipe}</h3>

        <div class="rating">
          ⭐ ${rating} <span>(${ratingCount})</span>
        </div>

        <div class="details">
          <span>${deliveryTime}</span> • 
          <span>${priceLevel}</span> •
          <span>Min.sepet tutarı ${minOrder} TL</span>
        </div>

        <div class="tags">
          ${isFreeDelivery ? `<span class="free">Ücretsiz</span>` : ""}
          ${discount ? `<span class="discount">%${discount} Seçili ürünlerde</span>` : ""}
          ${plus ? `<span class="plus">+${plus}</span>` : ""}
        </div>

      </div>
    </div>
    `;
  });
}

  toggleFavorite = (id) => {
    const recipe = this.recipes.find(r => r.id === id);

    if (recipe) {
      recipe.isFavorite = !recipe.isFavorite;
    }

    localStorage.setItem("recipes", JSON.stringify(this.recipes));
    this.renderRecipes();
  }
openRestaurant = (id) => {

  const restaurant = this.recipes.find(r => r.id === id);
  if (!restaurant) return;

  document.getElementById("HomePage").style.display = "none";
  document.getElementById("restaurantPage").style.display = "block";

  document.getElementById("resName").innerText = restaurant.recipe;
  document.getElementById("resImage").src = restaurant.image;

  const menuDiv = document.getElementById("menu");

  if (restaurant.menu) {

    let html = "";

restaurant.menu.forEach(item => {
  html += `
    <div class="menu-item">
      <img src="${item.image || 'https://via.placeholder.com/150'}">
      <h4>${item.name}</h4>
      <p>₺${item.price}</p>
      <button class="add-btn" onclick="app.addToCart(${item.id})">+</button>
    </div>
  `;
});

menuDiv.innerHTML = html;

} else {
    menuDiv.innerHTML = "<p>Menü böş</p>";
}
}
goBack() {
  document.getElementById("HomePage").style.display = "block";
  document.getElementById("restaurantPage").style.display = "none";
}






renderCategories = async () => {

  const categoryRow = document.getElementById("categoryRow");
  if (!categoryRow) return;

  const response = await fetch("categories.json");
  const categories = await response.json();

  categoryRow.innerHTML = categories.map((category) => `
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
}
const app = new RecipeApp();

