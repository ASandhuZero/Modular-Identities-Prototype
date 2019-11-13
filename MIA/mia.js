var stateInformation = {
 "alricToBeatriceKinship" : "NA",
 "loveToHeroDuty" : "NA",
 "alricToCedricKinship" : "NA",
 "alricToCedricDuty" : "NA",
 "alricToAlricKinship" : "NA",
 "alricToAlricDuty" :"NA",
 "heroStrength" : "NA",
 "heroIntelligence" : "NA"
};

var setUpInitialState = function(){
	//update our local copies of these variables, and display them.
	updateLocalStateInformation();
	displayStateInformation();
};

var updateTurn = function(){
	updateLocalStateInformation();
	displayStateInformation();
	console.log("update turn has fired.");
}

var displayStateInformation = function(){
	document.getElementById("kinshipAlricToBeatriceVal").innerHTML = stateInformation.alricToBeatriceKinship;
	document.getElementById("kinshipAlricToCedricVal").innerHTML = stateInformation.alricToCedricKinship;
	document.getElementById("kinshipAlricToAlricVal").innerHTML = stateInformation.alricToAlricKinship;
	document.getElementById("dutyAlricToBeatriceVal").innerHTML = stateInformation.alricToBeatriceDuty;
	document.getElementById("dutyAlricToCedricVal").innerHTML = stateInformation.alricToCedricDuty;
	document.getElementById("dutyAlricToAlricVal").innerHTML = stateInformation.alricToAlricDuty;
	document.getElementById("heroStrengthNumber").innerHTML = stateInformation.heroStrength;
	document.getElementById("heroIntelligenceNumber").innerHTML = stateInformation.heroIntelligence;
};

var updateLocalStateInformation = function(){
	//First, let's grab the data we'll want to display.
	var alricToBeatriceKinshipPred = {
		"class" : "bonds",	
		"type" : "kinship",
		"first" : "Alric",
		"second" : "Beatrice"
	};
	var alricToCedricKinshipPred = {
		"class" : "bonds",
		"type" : "kinship",
		"first" : "Alric",
		"second" : "Cedric"
	};
	var alricToAlricKinshipPred = {
		"class" : "bonds",
		"type" : "kinship",
		"first" : "Alric",
		"second" : "Alric"
	};
	var alricToBeatricePred = {
		"class" : "bonds",
		"type" : "duty",
		"first" : "Alric",
		"second" : "Beatrice"
	};
	var alricToCedricDutyPred = {
		"class" : "bonds",
		"type" : "duty",
		"first" : "Alric",
		"second" : "Cedric"
	};
	var alricToAlricDutyPred = {
		"class" : "bonds",
		"type" : "duty",
		"first" : "Alric",
		"second" : "Alirc"
	};
	var heroIntelligencePred = {
		"class" : "attribute",
		"type" : "intelligence",
		"first" : "Alric"
	};
	var heroStrengthPred = {
		"class" : "attribute",
		"type" : "strength",
		"first" : "Alric"
	};

	//Get love to hero kinship.
	var results = cif.get(alricToBeatriceKinshipPred);
	stateInformation.alricToBeatriceKinship = results[0].value;

	//Get love to rival kinship
	results = cif.get(alricToCedricKinshipPred);
	stateInformation.alricToAlricKinship= results[0].value;

	//Get hero to Love kinship
	results = cif.get(alricToAlricKinshipPred);
	stateInformation.alricToCedricKinship = results[0].value;

	//get love to hero duty
	results = cif.get(alricToBeatricePred);
	stateInformation.alricToBeatriceDuty = results[0].value;

	//get love to rival duty
	results = cif.get(alricToAlricDutyPred);
	stateInformation.alricToAlricDuty = results[0].value;

	//get hero to love duty
	results = cif.get(alricToCedricDutyPred);
	stateInformation.alricToCedricDuty = results[0].value;

	//get hero intelligence.
	results = cif.get(heroIntelligencePred);
	stateInformation.heroIntelligence = results[0].value;

	//get hero strength.
	results = cif.get(heroStrengthPred);
	stateInformation.heroStrength = results[0].value;
};