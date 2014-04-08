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
function populateIngredients(data) {
	var myObj = {};
	var toAppendString = "";

	// Get the four ingredients
	var ingredientsData = getRandos(DATA);

	// Create objects that underscore likes
	myObj["ingredients"] = ingredientsData;
	ingredientsData = myObj;
	
	// Compile the list
	for (i = 0; i < ingredientsData.ingredients.length; i++) {
		toAppendString += ingredientsTemplate(ingredientsData.ingredients[i]);
	}

	// Fade out current list 
	hideRecipes();

	// Append the list
	$(".viz-ingredients").html(toAppendString);

	// Fade out Recipes


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

function getRandos(data) {
	var ingredients = [];

	for (var i = 0; i < 4; i++) {
		var randomInt = getRandomInt(0, data.length);
		var ingredient = DATA[randomInt];
		ingredient["temp_index"] = i +1;
		fillJSON(ingredient["ingredient"]);
		ingredients.push(ingredient);
	};

	return ingredients;
}

function fillJSON(ingredient) {

	var url = "http://api.yummly.com/v1/api/recipes?_app_id=d4056344&_app_key=cf30fed394ef2013d82d03179ca4f961&q=" + ingredient;

	$.ajax({
	    type: 'GET',
	    url: url,
	    dataType: 'JSONP',
	    jsonp: 'callback',
	    success: function(json) {
	    	console.log("success");
	    	console.log(ingredient);
	    	console.log(json);
	    },
	    error: function(e) {
	    	console.log("fail");
	    	console.log(ingredient);
	    }
	});

	// function myFunc(data) {
	// 	console.log(data);
	// }

}






// HANDLERS
// =============================================
$(".viz-basket").on("click", function() {
	populateIngredients(DATA);
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


