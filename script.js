class RecipeApp {

  constructor() {
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
      ingredients: ingredients.split(","),
      image:imageUrl,
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

    this.recipes.forEach(({ id, recipe, ingredients, isFavorite,image}) => {
      resultDiv.innerHTML += `
        <div class="card">
          <h3>${recipe}</h3>
          <img src=${image} class="card-img">
          <p>${ingredients.join(", ")}</p>
          <p>${isFavorite ? "⭐ Favori" : ""}</p>
          <button onclick="app.toggleFavorite(${id})">Favori</button>
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

}

const app = new RecipeApp();