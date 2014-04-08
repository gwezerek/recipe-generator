/*jshint -W099 */

// SETUP VARIABLES
// =============================================
var spreadsheetURL = "/ingredients_pass_2.csv";
// var spreadsheetURL = "http://www.guswezerek.com/projects/recipe_generator/ingredients_pass_2.csv";

// For template
var vizEven = false;
var vizQuiz = false;
var ingredientsTemplate = _.template( $(".viz-ingredient-template").html() );


// SETUP
// =============================================






// LOAD DAT DATA
// =============================================

d3.csv(spreadsheetURL, function(error, myData) {
	DATA = myData;
});





// HELPERS
// =============================================
function getIngredients(data) {

	var ingredients = [];
	
	for (var i = 0; i < 4; i++) {
		var randomInt = getRandomInt(0, data.length);
		var ingredient = DATA[randomInt];
		fillJSON(ingredient, ingredients);
	};
}

function fillJSON(ingredient, ingredients) {

	var ingredientName = ingredient["ingredient"];

	var url = "http://api.yummly.com/v1/api/recipes?_app_id=d4056344&_app_key=cf30fed394ef2013d82d03179ca4f961&q=" + ingredientName + "&requirePictures=true";

	$.ajax({
	    type: 'GET',
	    url: url,
	    dataType: 'JSONP',
	    jsonp: 'callback',
	    success: function(json) {
	    	var matches = json["matches"];
	    	if (matches.length > 0) {
	    		console.log(matches);
		    	getRecipe1(matches, ingredient, ingredients);
	    	}
	    }
	});
}

function getRecipe1(matches, ingredient, ingredients){

	var url = "http://api.yummly.com/v1/api/recipe/" + matches[0]["id"] +"?_app_id=d4056344&_app_key=cf30fed394ef2013d82d03179ca4f961";

	var promise = $.ajax({
	    type: 'GET',
	    url: url,
	    dataType: 'JSONP',
	    jsonp: 'callback',
	    success: function(recipe) {
	    	ingredient["image_url"] = recipe["images"][0]["hostedLargeUrl"];
	    	ingredient["recipe1_name"] = recipe["name"];
	    	ingredient["recipe1_source"] = recipe["source"]["sourceDisplayName"];
	    	ingredient["recipe1_url"] = recipe["source"]["sourceRecipeUrl"];
	    	if (matches.length > 1) {
		    	getRecipe2(matches[1]["id"], ingredient, ingredients)
		    }
	    }
	});
}

function getRecipe2(id, ingredient, ingredients){

	var url = "http://api.yummly.com/v1/api/recipe/" + id +"?_app_id=d4056344&_app_key=cf30fed394ef2013d82d03179ca4f961";

	var promise = $.ajax({
	    type: 'GET',
	    url: url,
	    dataType: 'JSONP',
	    jsonp: 'callback',
	    success: function(recipe) {
	    	ingredient["recipe2_name"] = recipe["name"];
	    	ingredient["recipe2_source"] = recipe["source"]["sourceDisplayName"];
	    	ingredient["recipe2_url"] = recipe["source"]["sourceRecipeUrl"];

	    	pushUpdatedIngredient(ingredients, ingredient);
	    }
	});

	promise.done(function(){
		if (ingredients.length === 4) {
			populateIngredients(ingredients);
		}
	});
}

function populateIngredients(selectedIngredients) {

	var myObj = {};
	var toAppendString = "";

	// Create objects that underscore likes
	myObj["ingredients"] = selectedIngredients;
	selectedIngredients = myObj;
	
	// Compile the list
	for (i = 0; i < selectedIngredients.ingredients.length; i++) {
		var selected = selectedIngredients.ingredients[i];
		selected["temp_index"] = i +1;
		toAppendString += ingredientsTemplate(selected);
	}

	// Fade out current list 
	hideRecipes();

	// Append the list
	$(".viz-ingredients").html(toAppendString);

	// Reveal the ingredients one by one
	(function showIngredient (i) {          
		setTimeout(function () {   
			$(".viz-ingredient-item").eq(i).fadeIn(200);
			if (i < 4) {
				i++; 
				showIngredient(i);
			} else {
				showRecipes();
			}
		}, 500)
	})(0);
}

function hideRecipes() {
	$(".viz-subhead-recipes").hide();
}

function showRecipes() {
	$(".viz-subhead-recipes").fadeIn(200);
}

function pushUpdatedIngredient(ingredientsArray, ingredient) {
	ingredientsArray.push(ingredient);
}








// HANDLERS
// =============================================
$(".viz-basket").on("click", function() {
	getIngredients(DATA);
});

// $(".viz-ingredients").on("click", ".viz-ingredient-header", function() {
// 	var $this = $(this);
// 	var arrow = $this.find(".viz-arrow");

// 	$this.next(".viz-ingredient-description").slideToggle(300);
// 	$this.toggleClass("viz-ingredient-active");

// 	if ($this.hasClass("viz-ingredient-active")) {
// 		arrow.html("&#x25B2;");
// 	} else {
// 		arrow.html("&#x25bc;");
// 	}
// });



// GENERAL HELPERS
// =============================================

// Returns a random integer between min and max
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


