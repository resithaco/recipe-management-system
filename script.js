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

  addRecipe = () => {
    const recipeInput = document.getElementById("recipe");
    const ingredientInput = document.getElementById("ingredient");

    const recipeName = recipeInput.value;
    const ingredients = ingredientInput.value;

    if (!recipeName || !ingredients) {
      alert("Lütfen tarifin adını ve malzemelerini girin!");
      return;
    }

    const newRecipe = {
      id: Date.now(),
      recipe: recipeName,
      ingredients: ingredients.split(","),
      isFavorite: false
    };

    this.recipes.push(newRecipe);

    localStorage.setItem("recipes", JSON.stringify(this.recipes));

    recipeInput.value = "";
    ingredientInput.value = "";

    alert("Tarif eklendi!");
  }

  renderRecipes = () => {
    const resultDiv = document.getElementById("tariffs");

    if (!resultDiv) return;

    resultDiv.innerHTML = "";

    this.recipes.forEach(({ id, recipe, ingredients, isFavorite }) => {
      resultDiv.innerHTML += `
        <div class="card">
          <h3>${recipe}</h3>
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