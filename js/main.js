/*jshint -W099 */

// SETUP VARIABLES
// =============================================
// var spreadsheetURL = "/ingredients.tsv";
var spreadsheetURL = "http://www.guswezerek.com/projects/recipe_generator/ingredients.tsv";
var appID = "d4056344";
var appKey = "cf30fed394ef2013d82d03179ca4f961";

// Need to change to FC address once we have it
var baseUrl = "http://www.guswezerek.com/projects/recipe_generator/";
// var baseUrl = "http://localhost:8000";

// For template
var ingredientsTemplate = _.template( $(".viz-ingredient-template").html() );




// LOAD DAT DATA
// =============================================

d3.tsv(spreadsheetURL, function(error, myData) {
	DATA = myData;
	console.log()
	var ingredientsStr = decodeURI(window.location.search).substr(13).slice(0, -1);

	console.log(ingredientsStr);

	// if the url has a list of attached ingredients
	if (ingredientsStr) {
		getIngredients(DATA, ingredientsStr.split(","));
	}
});





// HELPERS
// =============================================
function getIngredients(data, preBakedList) {

	setStage();

	var ingredients = [];

	if (preBakedList) {

		// use indices from url
		for (var i = 0; i < 4; i++) {
			fillJSON(DATA[preBakedList[i]], ingredients);
		};	

	} else {

		// get four random ingredients
		for (var i = 0; i < 4; i++) {
			var randomInt = getRandomInt(0, data.length);
			var ingredient = DATA[randomInt];
			fillJSON(ingredient, ingredients);
		};	

	}

}


function fillJSON(ingredient, ingredients) {

	// Sometimes we search for a modified version of the ingredient to get results
	// Hence the need for a search_title column in the data
	var ingredientName = ingredient["search_title"];

	var url = "http://api.yummly.com/v1/api/recipes?_app_id=" + appID + "&_app_key=" + appKey + "&q=" + ingredientName + "&requirePictures=true";

	// Call the Yummly API to get a photo and up to two recipes for the ingredient
	$.ajax({
	    type: 'GET',
	    url: url,
	    dataType: 'JSONP',
	    jsonp: 'callback',
	    success: function(json) {
	    	var matches = json["matches"];

	    	// When we have at least two recipe matches for the ingredient
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

				// Now that we've loaded the recipe data into the ingredient object
	    		).then(function() {			

	    			// Push the ingredient into the empty ingredients array
			    	pushUpdatedIngredient(ingredients, ingredient);

			    	// If the array is full, it's time to reveal our ingredients
					if (ingredients.length === 4) {
						populateIngredients(ingredients);
					}

				});

	    	// When we only have one recipe match for the ingredient
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

			// When we have no recipe matches for the ingredient
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

// We filled out ingredients with info from the API
// Now we need to compile and append them to the DOM
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
				changeURL(selectedIngredients);
			}
		}, 500)
	})(0);

}

function hideRecipes() {
	$(".viz-subhead-recipes").hide();
}

function showRecipes() {
	$(".viz-source").addClass("viz-source-activated").fadeIn(200);
}

function changeURL(ingredients) {

	var pathString = "?ingredients=";

	// Stringify final ingredient list
	_.each(ingredients.ingredients, function(e, i) {
		if (i === 0) {
			pathString += encodeURIComponent(e.original_index);
		} else {
			pathString += ("," + encodeURIComponent(e.original_index));
		}
	});

	// Modify history with filled ingredients
	// So we can skip the API step if we load from scratch
	history.pushState("state", "title", baseUrl + pathString);

}

function setStage() {
	$(".viz-generator-header").removeClass("viz-header-start");
	$(".viz-copy").removeClass("viz-copy-start");
	$(".viz-source").fadeOut(200);
}










// HANDLERS
// =============================================
$(".viz-basket").on("click", function() {
	getIngredients(DATA);
});



// GENERAL HELPERS
// =============================================

// Returns a random integer between min and max
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


