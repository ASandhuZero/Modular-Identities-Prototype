var stateInformation = {
 "loveToHeroKinship" : "NA",
 "loveToHeroDuty" : "NA",
 "heroToLoveKinship" : "NA",
 "heroToLoveDuty" : "NA",
 "loveToRivalKinship" : "NA",
 "loveToRivalDuty" :"NA",
 "heroStrength" : "NA",
 "heroIntelligence" : "NA"
};


var setUpInitialState = function(){

	//Give every character a name.
	/*
	var heroTrait = {
		"class" : "trait",
		"type" : "hero",
		"first" : "hero",
		"value" : true
	};
	var loveTrait = {
		"class" : "trait",
		"type" : "love",
		"first" : "love",
		"value" : true
	};
	var rivalTrait = {
		"class" : "trait",
		"type" : "rival",
		"first" : "rival",
		"value" : true
	};

	//don't need to establish initial kinship values, because they default to 0 in the schema!
	// But keep it around for testing purposes.
	var tempKinship = {
		"class" : "bonds",
		"type" : "kinship",
		"first" : "love",
		"second" : "hero",
		"value" : 10
	};
	
	//Actually insert this state into CiF's social facts database.
	cif.set(heroTrait);
	cif.set(loveTrait);
	cif.set(rivalTrait);
	cif.set(tempKinship);
*/
	//update our local copies of these variables, and display them.
	updateLocalStateInformation();
	displayStateInformation();
};

var displayStateInformation = function(){
	document.getElementById("kinshipHeroToLoverNumber").innerHTML = stateInformation.heroToLoveCloseness;
	document.getElementById("kinshipLoverToHeroNumber").innerHTML = stateInformation.loveToHeroCloseness;
	document.getElementById("kinshipLoverToRivalNumber").innerHTML = stateInformation.loveToRivalCloseness;
	document.getElementById("dutyHeroToLoverNumber").innerHTML = stateInformation.heroToLoveDuty;
	document.getElementById("dutyLoverToHeroNumber").innerHTML = stateInformation.loveToHeroDuty;
	document.getElementById("dutyLoverToRivalNumber").innerHTML = stateInformation.loveToRivalDuty;
	document.getElementById("heroStrengthNumber").innerHTML = stateInformation.heroStrength;
	document.getElementById("heroIntelligenceNumber").innerHTML = stateInformation.heroIntelligence;
};

var updateLocalStateInformation = function(){
	//First, let's grab the data we'll want to display.
	var loveToHeroKinshipPred = {
		"class" : "bonds",
		"type" : "kinship",
		"first" : "Alric",
		"second" : "Beatrice"
	};
	var loveToRivalKinshipPred = {
		"class" : "bonds",
		"type" : "kinship",
		"first" : "Alric",
		"second" : "Cedric"
	};
	var heroToLoveKinshipPred = {
		"class" : "bonds",
		"type" : "kinship",
		"first" : "Alric",
		"second" : "Alric"
	};
	var loveToHeroDutyPred = {
		"class" : "bonds",
		"type" : "duty",
		"first" : "Alric",
		"second" : "Beatrice"
	};
	var heroToLoveDutyPred = {
		"class" : "bonds",
		"type" : "duty",
		"first" : "Alric",
		"second" : "Cedric"
	};
	var loveToRivalDutyPred = {
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
	var results = cif.get(loveToHeroKinshipPred);
	stateInformation.loveToHeroKinship = results[0].value;

	//Get love to rival kinship
	results = cif.get(loveToRivalKinshipPred);
	stateInformation.loveToRivalKinship= results[0].value;

	//Get hero to Love kinship
	results = cif.get(heroToLoveKinshipPred);
	stateInformation.heroToLoveKinship = results[0].value;

	//get love to hero duty
	results = cif.get(loveToHeroDutyPred);
	stateInformation.loveToHeroDuty = results[0].value;

	//get love to rival duty
	results = cif.get(loveToRivalDutyPred);
	stateInformation.loveToRivalDuty = results[0].value;

	//get hero to love duty
	results = cif.get(heroToLoveDutyPred);
	stateInformation.heroToLoveDuty = results[0].value;

	//get hero intelligence.
	results = cif.get(heroIntelligencePred);
	stateInformation.heroIntelligence = results[0].value;

	//get hero strength.
	results = cif.get(heroStrengthPred);
	stateInformation.heroStrength = results[0].value;
};