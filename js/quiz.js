/*jshint -W099 */

// SETUP VARIABLES
// =============================================
var spreadsheetURL = "/ingredients_pass_2.csv";
// var spreadsheetURL = "http://www.guswezerek.com/projects/recipes/ingredients.csv";

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
		console.log(ingredientsData.ingredients[i]);
		toAppendString += ingredientsTemplate(ingredientsData.ingredients[i]);
	}

	// Fade out current list 
	$(".viz-ingredients-item").fadeOut(200);

	// Append the list
	$(".viz-ingredients").html(toAppendString);

	// Reveal the ingredients one by one
	(function showIngredient (i) {          
		setTimeout(function () {   
			console.log($(".viz-ingredient-item"));
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

function showRecipes() {
	$(".viz-subhead-recipes").fadeIn(200);
}

function getRandos(data) {
	var ingredients = [];

	for (var i = 0; i < 4; i++) {
		var randomInt = getRandomInt(0, data.length);
		DATA[randomInt]["temp_index"] = i +1;
		ingredients.push(DATA[randomInt]);
	};

	return ingredients;
}




// HANDLERS
// =============================================
$(".viz-svg-wrap").on("click", "svg", function() {
	populateIngredients(DATA);
});

$(".viz-ingredients").on("click", ".viz-ingredient-header", function() {
	var $this = $(this);
	var arrow = $this.find(".viz-arrow");

	$this.next(".viz-ingredient-description").slideToggle(300);
	$this.toggleClass("viz-ingredient-active");

	if ($this.hasClass("viz-ingredient-active")) {
		arrow.html("&#x25B2;");
	} else {
		arrow.html("&#x25bc;");
	}
});



// HELPERS
// =============================================

// SVG godesend extension methods

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

SVGElement.prototype.hasClass = function(className) {
	return new RegExp('(\\s|^)' + className + '(\\s|$)').test(this.getAttribute("class"));
};

SVGElement.prototype.addClass = function(className) {
	if (!this.hasClass(className)) {
		this.setAttribute("class", this.getAttribute("class") + " " + className);
	}
};

SVGElement.prototype.removeClass = function(className) {
	var removedClass = this.getAttribute("class").replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2");
	if (this.hasClass(className)) {
		this.setAttribute("class", removedClass);
	}
};


// Returns a random integer between min and max
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


// THE SNAP SVG BITS
// =============================================
var s = Snap(".viz-svg-wrap");
Snap.load("/img/basket.svg", function (basket) {

	var smallLen = 2.5;
	var bigLen = 5;
	var duration = bigLen * 7500000;

	var smallRays = basket.selectAll(".viz-small-rays").attr({
		"stroke-dasharray": smallLen + " " + smallLen*1.4,
		"stroke-dashoffset": "0"
	});

	var bigRays = basket.selectAll(".viz-big-rays").attr({
		"stroke-dasharray": bigLen + " " + bigLen*1.4,
		"stroke-dashoffset": "0"
	});

	function animateRays() {
		raysIn(smallRays, smallLen);
		raysIn(bigRays, bigLen);
	}

	function raysIn(raysGroup, length) {
		raysGroup.forEach(function(el,i) {
			el.animate({"stroke-dashoffset": length * 100000}, duration);	
		});
	}

	// Animate dose rays
	// animateRays();

	$(".viz-button").on("click", function() {
		// animateRays();
	});

	// Append the SVG
	s.append(basket);

});


// D3 HELPERS
