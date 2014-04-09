/*jshint -W099 */

// SETUP VARIABLES
// =============================================
var spreadsheetURL = "/ingredients_finalEdit.csv";
// var spreadsheetURL = "http://www.guswezerek.com/projects/recipe_generator/ingredients_finalEdit.csv";
var appID = "d4056344";
var appKey = "cf30fed394ef2013d82d03179ca4f961";

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

	var ingredientName = ingredient["search_title"];

	var url = "http://api.yummly.com/v1/api/recipes?_app_id=" + appID + "&_app_key=" + appKey + "&q=" + ingredientName + "&requirePictures=true";

	$.ajax({
	    type: 'GET',
	    url: url,
	    dataType: 'JSONP',
	    jsonp: 'callback',
	    success: function(json) {
	    	var matches = json["matches"];

	    	if (matches.length > 1) {
		    	$.when(

		    		$.ajax({
					    type: 'GET',
					    url: "http://api.yummly.com/v1/api/recipe/" + matches[0]["id"] +"?_app_id=" + appID + "&_app_key=" + appKey,
					    dataType: 'JSONP',
					    jsonp: 'callback',
					    success: function(recipe) {
					    	ingredient["image_url"] = recipe["images"][0]["hostedLargeUrl"];
					    	ingredient["recipe1_name"] = recipe["name"];
					    	ingredient["recipe1_source"] = recipe["source"]["sourceDisplayName"];
					    	ingredient["recipe1_url"] = recipe["source"]["sourceRecipeUrl"];				    	
					    }
					}),

					$.ajax({
					    type: 'GET',
					    url: "http://api.yummly.com/v1/api/recipe/" + matches[1]["id"] +"?_app_id=" + appID + "&_app_key=" + appKey,
					    dataType: 'JSONP',
					    jsonp: 'callback',
					    success: function(recipe) {
					    	ingredient["recipe2_name"] = recipe["name"];
					    	ingredient["recipe2_source"] = recipe["source"]["sourceDisplayName"];
					    	ingredient["recipe2_url"] = recipe["source"]["sourceRecipeUrl"];
					    }
					})

	    		).then(function() {

			    	pushUpdatedIngredient(ingredients, ingredient);

					if (ingredients.length === 4) {
						populateIngredients(ingredients);
					}

				});

	    	} else if (matches.length > 0) {
		    	$.when(

		    		$.ajax({
					    type: 'GET',
					    url: "http://api.yummly.com/v1/api/recipe/" + matches[0]["id"] +"?_app_id=" + appID + "&_app_key=" + appKey,
					    dataType: 'JSONP',
					    jsonp: 'callback',
					    success: function(recipe) {
					    	ingredient["image_url"] = recipe["images"][0]["hostedLargeUrl"];
					    	ingredient["recipe1_name"] = recipe["name"];
					    	ingredient["recipe1_source"] = recipe["source"]["sourceDisplayName"];
					    	ingredient["recipe1_url"] = recipe["source"]["sourceRecipeUrl"];				    	
					    }
					})

	    		).then(function() {

			    	pushUpdatedIngredient(ingredients, ingredient);

					if (ingredients.length === 4) {
						populateIngredients(ingredients);
					}

				});
	    	} else {

	    		pushUpdatedIngredient(ingredients, ingredient);

				if (ingredients.length === 4) {
					populateIngredients(ingredients);
				}
	    	}
	    }
	});
}

function pushUpdatedIngredient(ingredientsArray, ingredient) {
	ingredientsArray.push(ingredient);
}

function populateIngredients(selectedIngredients) {

	var myObj = {};
	var toAppendString1 = "";
	var toAppendString2 = "";

	// Create objects that underscore likes
	myObj["ingredients"] = selectedIngredients;
	selectedIngredients = myObj;
	
	// Compile the list
	for (i = 0; i < selectedIngredients.ingredients.length; i++) {
		var selected = selectedIngredients.ingredients[i];
		selected["temp_index"] = i +1;
		if (i < 2) {
			toAppendString1 += ingredientsTemplate(selected);
		} else {
			toAppendString2 += ingredientsTemplate(selected);
		}
	}

	// Fade out current list 
	hideRecipes();

	// Append the lists
	$(".viz-ingredients-col-1").html(toAppendString1);
	$(".viz-ingredients-col-2").html(toAppendString2);

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










// HANDLERS
// =============================================
$(".viz-basket").on("click", function() {
	$(".viz-generator-header").removeClass("viz-header-start");
	$(".viz-copy").removeClass("viz-copy-start");
	getIngredients(DATA);
});



// GENERAL HELPERS
// =============================================

// Returns a random integer between min and max
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


