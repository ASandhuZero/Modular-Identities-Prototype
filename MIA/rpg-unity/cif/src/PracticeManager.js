/* jshint esversion:6, -W033 */
/*
This may be better named as SocialPracticeManager. It could contain high-level
functions dealing with social practices like: get choices, select actions,
apply effects and stage transition. Having it be the control point for using
social practices could be good. It would be like an add-on component to cif.js.
*/

define(["ruleLibrary","util","jquery","sfdb","aunlg"], function(ruleLibrary, util, $, sfdb, aunlg){

	var practices = [];

	var currentPractice = {};

	var currentRoleBindings = {};

	var currentStage = {};

	var currentCast;

	var currentAction = {};

	var possibleActions = [];

	var scoredActionsInfo = [];
	var scoredMTInfo = {};

	var defaultPerformanceLine = "";

	var addPractice = function(rawPractice) {
		practices.push(rawPractice.practice);
	}

	var removePractice = function(practice) {
		var index = practices.indexOf(practice);
		if (index !== -1) {
			practices.splice(index, 1);
			return;
		}
	//	console.log("removePractice() - Tried to remove a practice that was not in practices.");
	}

	var setCast = function(cast) {
		currentCast = cast;
	}

	var getPractices = function() {return practices;}
	var setPractices = function(value) {practices = value;}

	var getCurrentPractice = function() {return currentPractice;}
	var getPracticeByName = function(practiceName)
	{
		var practices = getPractices();
		for (var practiceCount = 0; practiceCount < practices.length; practiceCount++) {
			if (practiceName === practices[practiceCount].label) {
				return practices[practiceCount];
			}
		}
	}

	var setCurrentPractice = function(value) {
		if (typeof value === "string") {
			currentPractice = getPracticeByName(value);
		}
		else {
			currentPractice = value;
		}
		//This is where we reset the contexts for a practice
		currentPractice.actionContexts = [];
		if (currentPractice.subject !== undefined) {
			delete currentPractice.subject;
		}
		//contextHistory.push(currentPractice.actionContexts);
	}

	var isEmptyObject = function (obj) {
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      return false;
	    }
	  }
	  return true;
	}
	var getCurrentStage = function() {return currentStage;}
	var setCurrentStage = function(value) {
		var practice = getCurrentPractice();
		if (isEmptyObject(practice)) {
	//		console.log("setCurrentStage(" + value + "): currentPractice not set.");
		}
		else if (typeof value === "string") {
			var stages = practice.stages;
			for (var stageCount = 0; stageCount < stages.length; stageCount++) {
				if (value === stages[stageCount].label) {
					currentStage = stages[stageCount];
					return;
				}
			}
			if (value === undefined) {
				currentStage = value;
			}
			//console.log("setCurrentStage(" + value + "): Stage by name " + value + " was not found in the current practices stages.");
		}
		else {
			currentStage = value;
		}
	}

	var getPossibleActions = function() { return possibleActions; }

	var getCurrentAction = function() {return currentAction;}
	//It is assumed that we always get current action based on the current stage
	var setCurrentAction = function(value) {
		var stage = getCurrentStage();
		if (isEmptyObject(stage)) {
	//		console.log("setCurrentAction(" + value + "): currentStage not set.");
		}
		else if (stage === undefined) {

		}
		else if (typeof value === "string") {
			var actions = getPossibleActions();
			for (var actionCount = 0; actionCount < actions.length; actionCount++) {
				if (value === actions[actionCount].label) {
					currentAction = actions[actionCount];
					return;
				}
			}
	//		console.log("setCurrentAction(" + value + "): Action by name " + value + " was not found in the current stage of the current practice.");
		}
		else {
			currentAction = value;
		}
	}

	var getCurrentRoleBindings = function() {
		return currentRoleBindings;
	}

	var launchStage = function(stage, x, y) {
		currentRoleBindings.x = x;
		currentRoleBindings.y = y;
		setCurrentStage(stage);
	}


	// practiceManager.getActions({"x":lars, "y":katrina})
	var generateActions = function(considerEventStages) {
		var roleBindings = currentRoleBindings;
		var cast = currentCast;

		var actionList = [];
		var ruleResult = {};
		var actionCount = 0;
		var stageActions = [];
		var actionToPush = {};

		//get all actions from currentPractice's next stages
		var stage = getCurrentStage();
		var nextStages;
		if (stage === undefined) {
			//If we don't have a currentStage, assume we are at the beginning of a
			//practice and set nextStages to the currentPractice's entryStages.
			nextStages = getCurrentPractice().entryStages;
		} else {
			nextStages = stage.nextStages;
		}

		for (var stageCount = 0; stageCount < nextStages.length; stageCount++) {
			var nextStage = getStageByLabel(nextStages[stageCount]);
			stageActions = nextStage.actions;
			for (actionCount = 0; actionCount < stageActions.length; actionCount++) {
				//if the precondition for the action is true
				ruleResult = evaluateRule(stageActions[actionCount].preconditions, roleBindings, cast);
				if(ruleResult.success) {
					//NOTE: we are adding a element to this particular list of actions. This element is not part of the action class.
					actionToPush = util.clone(stageActions[actionCount]);
					actionToPush.possibleRoleBindings = ruleResult.possibleRoleBindings;
					actionList.push(actionToPush);
				}
			}
		}

		if (considerEventStages) {
			//get all actions from eventStages
			var eventStages = currentPractice.eventStages;
			for (var eventCount = 0; eventCount < eventStages.length; eventCount++){
				stageActions = eventStages[eventCount].actions;
				for (actionCount = 0; actionCount < stageActions.length; actionCount++) {
					ruleResult = evaluateRule(stageActions[actionCount].preconditions, roleBindings, cast);
					if(ruleResult.success) {
						//NOTE: we are adding a element to this particular list of actions. This element is not part of the action class.
						actionToPush = util.clone(stageActions[actionCount]);
						actionToPush.possibleRoleBindings = ruleResult.possibleRoleBindings;
						actionList.push(actionToPush);
					}
				}
			}
		}


		possibleActions = actionList;
	};

	/*
	A context {practice, stage, action, roleBindings}
	*/

	var getActionByName = function(actionName) {
			var actionList = getPossibleActions();

			for (var i=0; i<actionList.length; i++)
			{
				if (actionList[i].label === actionName)
					return actionList[i];
			}

			return;
	}

	var selectAction = function(cast, actionList) {
		if (typeof actionList === undefined) {
			actionList = getPossibleActions();
		}

		//Clear our scoredInfo objects used for logging (for now)
		scoredActionsInfo = [];
		scoredMTInfo = {};

		var selectedAction;
		var maxScore;
		var x = currentRoleBindings.x;//currentContext.roleBindings.x;
		var y = currentRoleBindings.y;//currentContext.roleBindings.y;
		var previousX = currentRoleBindings.y//previousContext.roleBindings.x;
		var previousY = currentRoleBindings.x//previousContext.roleBindings.y;
		var mtCache = {};

		for(var actionIndex = 0; actionIndex < actionList.length; ++actionIndex) {
			var score = 0;
			var mtScore = 0;
			var nowScore = 0;
			var carryScore = 0;

			var action = actionList[actionIndex];

			var actionInfo = {};
			scoredActionsInfo.push(actionInfo);
			actionInfo.label = action.label;
			actionInfo.intent = action.intent;

			//run the mt of the intent of the action if it has not been already scored for x and y
			//microtheory rules
			//run the microtheory associated with the intent of the action.
			var intent = action.intent;
			if(mtCache[intent] === undefined) {
				scoredMTInfo[intent] = {rules:[]};
				mtCache[intent] = 0;

				var mt = ruleLibrary.getRuleSet(intent);
				for (var ruleIndex = 0; ruleIndex < mt.length; ruleIndex++) {
					var result = evaluateRule(mt[ruleIndex].conditions, {"x":x, "y":y}, cast, false);
					var scoredRuleInfo = util.clone(mt[ruleIndex]);
					scoredRuleInfo.result = result;
					scoredMTInfo[intent].rules.push(scoredRuleInfo);
					scoredRuleInfo.score = 0;
					if(result.success) {
						/* Adding support for each predicate in the effects to have a weight. */
						var currentMTRuleScore = 0;
						for (var mtRuleEffectIndex = 0; mtRuleEffectIndex < mt[ruleIndex].effects.length; mtRuleEffectIndex++) {
							currentMTRuleScore += mt[ruleIndex].effects[mtRuleEffectIndex].weight;
						//	console.log("WEIGHTCHECK: " + mt[ruleIndex].effects[mtRuleEffectIndex].weight);
						}
						mtCache[intent] += currentMTRuleScore;
						scoredRuleInfo.score = currentMTRuleScore;
					}
				}
				scoredMTInfo[intent].score = mtCache[intent];
			}

			mtScore = mtCache[intent];

			//3. now rules
			var maxNowRuleScore = undefined;
			var nowRoleBinding = {};
			for (var roleBindingIndex = 0; roleBindingIndex < action.possibleRoleBindings.length; roleBindingIndex++){
				roleBinding = action.possibleRoleBindings[roleBindingIndex];
				var currentNowScore = 0;

				actionInfo.nowRules = [];
				for(var nowIndex = 0; nowIndex < action.nowRules.length; nowIndex++) {
					var nowRule = action.nowRules[nowIndex];

					var nowRuleResult = evaluateRule(nowRule.conditions, roleBinding, cast, false);

					if(nowRuleResult.success){
						var trueNowRuleTotal = 0;
						for (var nowEffectIndex = 0; nowEffectIndex < nowRule.effects.length; nowEffectIndex++){
							trueNowRuleTotal += nowRule.effects[nowEffectIndex].weight;
						}
						currentNowScore += trueNowRuleTotal;
						roleBinding = $.extend({}, roleBinding, nowRuleResult.possibleRoleBindings[0]);

						var nowRuleInfo = util.clone(nowRule);
						nowRuleInfo.result = nowRuleResult;
						nowRuleInfo.score = currentNowScore;
						actionInfo.nowRules.push(nowRuleInfo);
					}
				}

				if(maxNowRuleScore === undefined) {
					maxNowRuleScore = currentNowScore;
					nowRoleBinding = roleBinding;
				}

				//found a new action with the highest score so far
				if(currentNowScore > maxNowRuleScore) {
					maxNowRuleScore = currentNowScore;
					nowRoleBinding = roleBinding;
				}
			}

			if(maxNowRuleScore === undefined) {
				maxNowRuleScore = 0;
			}
			nowScore = maxNowRuleScore;

			//4. carry rules
			actionInfo.carryRules = [];
			for(var carryIndex = 0; carryIndex < action.carryRules.length; carryIndex++) {
				var carryRule = action.carryRules[carryIndex];
				var carryRuleResult = evaluateRule(carryRule.conditions, {"x":previousX, "y":previousY}, cast, false);
				if(carryRuleResult.success) {
					/* Adding support for each predicate in the effects to have a weight. */
					for (var carryEffectIndex = 0; carryEffectIndex < carryRule.effects.length; carryEffectIndex++){
						carryScore += carryRule.effects[carryEffectIndex].weight;
					}

					var carryRuleInfo = util.clone(carryRule);
					carryRuleInfo.result = carryRuleResult;
					actionInfo.carryRules.push(carryRuleInfo);
				}
			}

			score = action.defaultWeight + mtScore + nowScore + carryScore;

			actionInfo.defaultWeight = action.defaultWeight;
			actionInfo.mtScore = mtScore;
			actionInfo.nowScore = nowScore;
			actionInfo.carryScore = carryScore;
			actionInfo.score = score;
			actionInfo.chosenRoleBindings = nowRoleBinding;

		//	console.log("Action " + action.label + " with intent " + action.intent + " has a score of " + score + " <" + action.defaultWeight + ", " + mtScore + ", " + nowScore + ", " + carryScore + ">");

			/*The first action scored should become the current selection and
			 set the max score.*/
			if(maxScore === undefined) {
				maxScore=score;
				selectedAction = action;
				selectedAction.chosenRoleBindings = nowRoleBinding;
			}

			//found a new action with the highest score so far
			if(score > maxScore) {
				maxScore = score;
				selectedAction = action;
				selectedAction.chosenRoleBindings = nowRoleBinding;
			}
		}

		//return the selected action;


		// console.log(x + " chose the following action: " + selectedAction.label)
		//
		// console.dir(scoredMTInfo);
		// console.dir(scoredActionsInfo);

		return selectedAction;
	};

	var setBestRoleBindingForAction = function(action, cast) {
		var action = selectAction(cast, [action]);
		setCurrentAction(action);
		currentRoleBindings = action.chosenRoleBindings;
	}

	var applyEffects = function() {
		var action = getCurrentAction();
		var effects = getCloneOfBoundPredicates(action.effects, currentRoleBindings);
		for (var effectCount = 0; effectCount < effects.length; effectCount++) {
			sfdb.set(effects[effectCount]);
		}

		//Create and add an actionContext for this action
		currentPractice.actionContexts.push({
			"practice": currentPractice.label,
			"actionLabel": action.label,
			"time": sfdb.getCurrentTimeStep(),
			"bindings": action.chosenRoleBindings,
			"effects": action.effects
		});

		sfdb.setupNextTimeStep();
	//	console.log("Current time: " + sfdb.getCurrentTimeStep());
	//	sfdb.dumpSFDB();
	};

	var getCloneOfBoundPredicates = function(preds, bindings) {
		var boundPreds = util.clone(preds);
		for (var predCount = 0; predCount < boundPreds.length; predCount++) {
			var pred = boundPreds[predCount];
			pred.first = bindings[pred.first];
			pred.second = bindings[pred.second];
		}
		return boundPreds;
	}

	var instantiatePerformance = function() {
		var currentAction = getCurrentAction();
		var performances = currentAction.performanceTree;
		var performance;

		if (performances === undefined || Object.keys(performances).length === 0) {
			if (currentAction.performance !== undefined) {
				performance = currentAction.performance;
			} else {
				console.log(currentAction.label + " doesn't have a performance or performance tree");
				performance = "...ERROR...";
			}
		} else {
			//This encodes the assumption that applyEffects MUST be called
			//before this instantiatePerformance function.
			performance = performances[currentPractice.actionContexts[0].actionLabel];
			for (var contextIndex = 1; contextIndex <  currentPractice.actionContexts.length; contextIndex++) {
				var context = currentPractice.actionContexts[contextIndex];
				performance = performance[context.actionLabel];
			}
			if (performance.line === "" || performance.useDefault) {
				//No line found in the performance tree. Using default.
				if (currentAction.performance !== undefined) {
					performance = currentAction.performance;
				} else {
					console.log(currentAction.label + " doesn't have a performance or performance tree");
					performance = "...ERROR...";
				}
			} else {
				//This means we found a line in the performance tree.
				performance = performance.line;
			}
		}

		performance = performance.replace(/%X%/g, currentRoleBindings.x);
		performance = performance.replace(/%Y%/g, currentRoleBindings.y);
		performance = performance.replace(/%subject%/g, currentPractice.subject);

		var locutions = aunlg.preprocessDialogue(performance, currentRoleBindings);

		var finalPerformance = "";
		for (var locution in locutions) {
			finalPerformance += locutions[locution].renderText();
		}

		return finalPerformance;
	};

	var stageTransition = function() {
		var nextStages = getCurrentStage().nextStages;
		var currentActionLabel = getCurrentAction().label;

		for (var nextStageCount = 0; nextStageCount < nextStages.length; nextStageCount++) {
			var actions = getStageByLabel(nextStages[nextStageCount]).actions;
			for (var actionCount = 0; actionCount < actions.length; actionCount++) {
				if (currentActionLabel === actions[actionCount].label) {
					setCurrentStage(nextStages[nextStageCount]);
					return;
					//console.log("There is a next stage!");
				}
			}
		}
	};

	var getEventStageByLabel = function(stageName, practice) {
		practice = practice || getCurrentPractice();
		for (var stageCount = 0; stageCount < practice.eventStages.length; stageCount++) {
			var stage = practice.eventStages[stageCount];
			if (stage.label === stageName)
				return stage;
		}
	}

	var getStageByLabel = function(stageName, practice) {
		practice = practice || getCurrentPractice();
		for (var stageCount = 0; stageCount < practice.stages.length; stageCount++) {
			var stage = practice.stages[stageCount];
			if (stage.label === stageName) {
				return stage;
			}
		}
	}
	var getActionByLabel = function(actionName, practice) {
		practice = practice || getCurrentPractice();
		var actionToReturn;
		$.each(practice.stages, function(i, stage) {
			$.each(stage.actions, function(j, action) {
				if (action.label.toLowerCase() === actionName.toLowerCase()) {
					actionToReturn = action;
				}
			});
		});
		return actionToReturn;
	}

	var getActionByLabelFromAnyPractice = function(actionName) {
		var actions = [];
		for(var practice of practices) {
			for(var stage of practice.stages) {
				for(var action of stage.actions) {
					if (action.label.toLowerCase() === actionName.toLowerCase()) {
						actions.push(action);
					}
				}
			}
		}
		return actions
	}

	var inTerminalStage = function() {
		if (getCurrentStage().nextStages.length === 0) {
			return true;
		}
		return false;
	}

	// if the stage is deleted, need to update the nextStage labels to not reference
	// it anymore
	var deleteStage = function(practiceName, stageName)
	{
		setCurrentPractice(practiceName);

		// if the stage we're deleting is in nextStages, remove it from the list
		$.each(currentPractice.stages, function(i, stage) {
			var nextIndex = $.inArray(stageName, stage.nextStages);
			if (nextIndex !== -1) {
				stage.nextStages.splice(nextIndex, 1);
			}
			var parentIndex = $.inArray(stageName, stage.parentStages);
			if (parentIndex !== -1) {
				stage.parentStages.splice(parentIndex, 1);
			}
		});

	}

	// if the stage name has changed, need to update the nextStage labels for other
	// stages that point to this one
	var updateStage = function(practiceName, oldStageName, newStageName)
	{
		// reset practice with new stage info
		setCurrentPractice(practiceName);

		if (newStageName !== oldStageName)
		{
			// stage name has updated and we need to update nextStage labels that may exist
			// go through the next stages of every other stage and see if references old name
			// of this stage. If so, update to new stage name.
			for (var i = 0; i < currentPractice['stages'].length; i++) {
				var curStage = currentPractice['stages'][i];
				for (var j=0; j < curStage.nextStages.length; j++)
				{
					if (curStage.nextStages[j] === oldStageName)
					{
						currentPractice.stages[i].nextStages[j] = newStageName;
						break;
					}
				}
			}
		}
	}



	/*
	get/set

	add/remove/get
		practices

	load practices from json
		call to cif to load individual rules

	MT to intent binding

	Procedures to place:
		score given current stage and previous context


	*/

	/**************************************************************************
	 * evaluateRule implementation and support functions.
	 *************************************************************************/

	 /*
	  * TODO: NOTE: This function really accepts an array of conditions and not a rule.
	  *
	  * This no longer returns a simple true or false value. Now it needs to return
	  * true/false and all of the known character bindings that made the rule's
	  * condition evaluate to true.
	  * returns: {success:true|false, knownRoleBindings[{}*]}
	  */
	var evaluateRule = function(conditions, knownRoleBindings, cast, runAll) {
		if (conditions.length === 0) {
			return {"success":true, "possibleRoleBindings":[knownRoleBindings]};
		}

		if(typeof runAll !== undefined){
			runAll=true;
		}

		//----- BEGIN HACK -----
		//To improve performance for evluating conditions that do have the type of
		//character, if the conditions do not contain a role with the keyword
		//"object", we remove all cast members without "type: 'character'".
		var objectPresentInARole = false;
		for (var i; i<conditions.length; i++) {
			var condition = conditions[i];
				if (condition.first.indexOf("object") != -1) {
					objectPresentInARole = true;
				}
				if (condition.second !== undefined && condition.second.indexOf("object") != -1) {
					objectPresentInARole = true;
				}
		}
		if (!objectPresentInARole) {
			//Only add cast members with 'type: "character"'
			var onlyCharacterCast = [];
			for (var i = 0; i < cast.length; i++) {
				if (cast[i].type === "character") {
					onlyCharacterCast.push(cast[i]);
				}
			}
			cast = onlyCharacterCast;
		}
		//----- END HACK -----

		//getUnkownRoles(conditions, knownRoleBindings)
		var unkownRoles = getUnkownRoles(conditions, knownRoleBindings);

		//getUnboundCast(knownRoleBindings, cast)
		var unboundCast = getUnboundCast(knownRoleBindings, cast);

		//cast into array for order
		var unboundCastArray = objectToArray(unboundCast);

		//turn unknown role bindings into an array
		var unknownRolesToSearchIndex = objectToArray(unkownRoles);

		var setOfAllTrueRoleBindings = [];

		//true if there is no longer a role binding search space left to search
		var searchSpaceExhausted = false;

		var searchState = [];
		//initialize search space into [0,1,2,3,..,length-1]
		for (var i = 0; i < unknownRolesToSearchIndex.length; i++) {
			searchState.push(i);
		}

		// The case where all the role bindings are known coming in to evaulateRule call.
		/*if(searchState.length < 1) {
			searchSpaceExhausted = true;
		}*/


		while (!searchSpaceExhausted) {
			var boundConditions = generateConditionsWithRoleBindings(conditions, searchState, unboundCast, knownRoleBindings, unknownRolesToSearchIndex);

			if (ruleLibrary.evaluateConditions(boundConditions, {}, {})) {
				allRoleBindings = generateRoleBindings(searchState, unboundCast, knownRoleBindings, unknownRolesToSearchIndex);
				// console.log("TRUE RULE: ***********");
				// console.log(ruleLibrary.predicateArrayToEnglish(boundConditions, false));
				// console.log("---------------");
				if(!runAll) {
					return {"success":true, "possibleRoleBindings":[allRoleBindings]};
				}
				setOfAllTrueRoleBindings.push(allRoleBindings);
			}
			else {
				// console.log("FALSE RULE: ");
				// console.log(ruleLibrary.predicateArrayToEnglish(boundConditions, false));
				// console.log("---------------");
			}

			//wi means window index
			var doneSlidingWindow = false;
			for (var wi = searchState.length-1; wi >= 0 && !doneSlidingWindow; wi--) {
				if (searchState[wi] > highestAvailable(wi, searchState, unboundCast.length)) {
					searchState[wi] = -1;
				}
				else {
					searchState[wi] = nextHighestAvailable(wi, searchState, unboundCast.length);
					doneSlidingWindow = true;
				}
			}

			if (searchState[0] == -1 || searchState.length === 0) {
				searchSpaceExhausted = true;
			}

			for (var i = 0; i < searchState.length; i++) {
				if (searchState[i] == -1) {
					searchState[i] = lowestAvailable(wi, searchState, unboundCast.length);
				}
			}

		}

		if(setOfAllTrueRoleBindings.length > 0) {
			return {"success":true, "possibleRoleBindings":setOfAllTrueRoleBindings};
		}
		return {"success":false, "possibleRoleBindings":[]};
	}

	var testEvaluateRule = function() {
		var conditions = [{"first":"X","second":"Y"},{"first":"X","second":"Z"},{"first":"X","second":"W"}];
		var cast = {"A":{},"B":{},"C":{},"D":{},"E":{}};
		evaluateRule(conditions, {"W":"A"}, cast);
	}


	var highestAvailable = function(wi, searchState, unboundCastLength) {
		var valsInSearchState = {};
		for (var i = 0; i < searchState.length; i++) {
			//Note, the value doesn't matter, we just want keys to be represented
			valsInSearchState[searchState[i]] = i;
		}
		for (var potentialHighestVal = unboundCastLength - 1; potentialHighestVal >= 0; potentialHighestVal--) {
			if (!(potentialHighestVal in valsInSearchState)) {
				return potentialHighestVal;
			}
		}
	//	console.log("highestAvailable() - There was no value left to be highest.");
	}

	var nextHighestAvailable = function(wi, searchState, unboundCastLength) {
		var valsInSearchState = {};
		for (var i = 0; i < searchState.length; i++) {
			//Note, the value doesn't matter, we just want keys to be represented
			valsInSearchState[searchState[i]] = i;
		}
		for (var potentialVal = searchState[wi] + 1; potentialVal < unboundCastLength; potentialVal++) {
			if (!(potentialVal in valsInSearchState)) {
				return potentialVal;
			}
		}
	//	console.log("nextHighestAvailable() - There was no value left to be next highest.");
		return -1
	}

	var lowestAvailable = function(wi, searchState, unboundCastLength) {
		var valsInSearchState = {};
		for (var i = 0; i < searchState.length; i++) {
			//Note, the value doesn't matter, we just want keys to be represented
			valsInSearchState[searchState[i]] = i;
		}
		for (var potentialLowestVal = 0; potentialLowestVal < unboundCastLength; potentialLowestVal++) {
			if (!(potentialLowestVal in valsInSearchState)) {
				return potentialLowestVal;
			}
		}
	//	console.log("lowestAvailable() - There was no value left to be lowest.");
	}

	var generateConditionsWithRoleBindings = function(conditions, searchState, unboundCast, knownRoleBindings, unknownRolesToSearchIndex) {
		var boundConditions = [];

		for (var condIndex = 0; condIndex < conditions.length; condIndex++) {
			var boundCondition = util.clone(conditions[condIndex]);

			if (boundCondition.first in knownRoleBindings) {
				boundCondition.first = knownRoleBindings[boundCondition.first];
			}
			else if (boundConditions !== undefined) {
				boundCondition.first = convertSearchStateIndexToCastMember(searchState, unboundCast, unknownRolesToSearchIndex, boundCondition.first);
			}

			if (boundCondition.second in knownRoleBindings) {
				boundCondition.second = knownRoleBindings[boundCondition.second];
			}
			else if (boundConditions !== undefined) {
				boundCondition.second = convertSearchStateIndexToCastMember(searchState, unboundCast, unknownRolesToSearchIndex, boundCondition.second);
			}

			boundConditions.push(boundCondition);
		}

		return boundConditions;
	}

	//return all roles bound with characters for a rule
	var generateRoleBindings = function(searchState, unboundCast, knownRoleBindings, unknownRolesToSearchIndex) {
		var allBindings = util.clone(knownRoleBindings);
		for (var searchStateIndex = 0; searchStateIndex < searchState.length; searchStateIndex++) {
			var role = unknownRolesToSearchIndex[searchStateIndex];
			allBindings[role] = convertSearchStateIndexToCastMember(searchState, unboundCast, unknownRolesToSearchIndex, role);
		}
		return allBindings;
	}

	var convertSearchStateIndexToCastMember = function(searchState, unboundCast, unknownRolesToSearchIndex, roleName) {
		for (var i = 0; i < unknownRolesToSearchIndex.length; i++) {
			if(unknownRolesToSearchIndex[i] === roleName) {
				//var roleIndex = unknownRolesToSearchIndex[i];
				var unboundCastIndex = searchState[i];
				return unboundCast[unboundCastIndex];
			}
		}
	}

	var getUnkownRoles = function(conditions, knownRoleBindings) {
		var unkownRoleBindings = {};

		for(var condCount = 0; condCount < conditions.length; condCount++) {
			cond = conditions[condCount];
			if (!(cond.first in knownRoleBindings) && cond.first !== undefined) {
				unkownRoleBindings[cond.first] = "";
			}
			if (!(cond.second in knownRoleBindings) && cond.second !== undefined) {
				unkownRoleBindings[cond.second] = "";
			}
		}

		return unkownRoleBindings;
	}

	var getUnboundCast = function(knownRoleBindings, cast) {
		var unknownCast = [];
		for (var castCount = 0; castCount < cast.length; castCount++) {
			var castName = cast[castCount];
			var found = false;
			for (var key in knownRoleBindings) {
				if (knownRoleBindings[key] === castName) {
					found = true;
				}
			}
			if (!found) {
				unknownCast.push(castName);
			}
		}
		return unknownCast;
	}

	//makes an array from the first level of keys in the object.
	var objectToArray = function(o) {
		var array = [];
		for(var key in o) {
			array.push(key);
		}
		return array;
	}

	var getScoredActionsInfo = function() {
		return scoredActionsInfo;
	}

	var getScoredMTInfo = function() {
		return scoredMTInfo;
	}


	//This is meant to be private
	//This function takes a merged perforamnce tree containing all parent and self
	//performance trees. It removes lines that are from parents. Default Lines are
	//added when a direct parent's old line is removed.
	var modifyLeavesRecursively = function(subtree, actionLabelToAdd, defaultLine, actionLabelsToUpdate) {
		$.each(subtree, function(key, value) {
			if (value instanceof Object) {
				if ($.inArray(key, actionLabelsToUpdate) != -1) {
					if (value.line !== undefined && key !== actionLabelToAdd) {
						delete value.line;
					}
					if(value[actionLabelToAdd] === undefined) {
						value[actionLabelToAdd] = {"line":defaultLine};
					}
				}
				modifyLeavesRecursively(value, actionLabelToAdd, defaultLine, actionLabelsToUpdate);
			}
		});
	};

	//This is meant to be private
	var markStagesThatNeedUpdating = function(stage) {
		stage.needsPerformanceTreeUpdate = true;
		$.each(stage.nextStages, function(i, nextStageName) {
			markStagesThatNeedUpdating(getStageByLabel(nextStageName, currentPractice));
		});
	};

	var unmarkStagesThatNeedUpdating = function(stage) {
		if (stage.needsPerformanceTreeUpdate !== undefined) {
			delete stage.needsPerformanceTreeUpdate;
		}
		$.each(stage.nextStages, function(i, nextStageName) {
			unmarkStagesThatNeedUpdating(getStageByLabel(nextStageName, currentPractice));
		});
	};

	//This is meant to be private
	//This function assumes that markStagesThatNeedUpdating was valled
	var getTerminalStagesThatNeedsPerformanceTreeUpdate = function() {
		var terminalStages = [];
		$.each(currentPractice.stages, function(i, stage) {
			if (stage.needsPerformanceTreeUpdate !== undefined) {
				if (stage.nextStages.length == 0 && stage.needsPerformanceTreeUpdate) {
					terminalStages.push(stage);
				}
			}
		});
		return terminalStages;
	}

	var updateActionPerformanceTrees = function(fromStage, toStage) {
		markStagesThatNeedUpdating(toStage);
		var terminalStages = getTerminalStagesThatNeedsPerformanceTreeUpdate();

		$.each(terminalStages, function(i, stage) {
			updatePerformanceTreesOfSingleStage(stage);
		});
		unmarkStagesThatNeedUpdating(toStage);
	}

	var updatePerformanceTreesOfSingleStage = function(stage) {
		var parentStages = [];
		$.each(stage.parentStages, function(i, value) {
			parentStages.push(getStageByLabel(value, currentPractice));
		});
		$.each(parentStages, function(i, parent) {
			if (parent.needsPerformanceTreeUpdate) {
				updatePerformanceTreesOfSingleStage(parent);
				delete parent.needsPerformanceTreeUpdate;
			}
		});

		//This will the merged performance trees from all actions, from all parent
		var mergedParents = {};
		var parentActionLabels = [];
		$.each(parentStages, function(i, parent) {
			$.each(parent.actions, function(i, action) {
				$.extend(true, mergedParents, action.performanceTree);
				parentActionLabels.push(action.label);
			});
		});

		$.each(stage.actions, function(i, action) {
			var merged = {};
			$.extend(true, merged, mergedParents);
			//This condition strives to preserve orphaned stage's performanceTrees
			if (stage.parentStages.length >= 1) {
				if(action.performanceTree[action.label] !== undefined && action.performanceTree[action.label].line !== undefined) {
					delete action.performanceTree[action.label];
				}
			}
			$.extend(true, merged, action.performanceTree);

			modifyLeavesRecursively(merged, action.label, defaultPerformanceLine, parentActionLabels);
			action.performanceTree = merged;
		});
		//delete stage.needsPerformanceTreeUpdate;
	}

	var updateActionLabelForAllPerformanceTrees = function(newLabel, oldLabel) {
		$.each(currentPractice.stages, function(i, stage) {
			$.each(stage.actions, function(i, action) {
				performanceTreeLabelRename(newLabel, oldLabel, action.performanceTree);
			});
		});
	}
	//Meant to be private
	var performanceTreeLabelRename = function(newLabel, oldLabel, subtree) {
		$.each(subtree, function(key, value) {
			if (value instanceof Object) {
				if (key === oldLabel) {
					subtree[newLabel] = value;
					delete subtree[key];
				}
				performanceTreeLabelRename(newLabel, oldLabel, value);
			}
		});
	}

	//NOTE: The linkages between the currentStage.nextStages and currentStage.parentStages
	//have already been removed in the tool (this should probably be changed...)
	var pruneParentFromPerformanceTree = function(parentLabelToPrune, childLabel) {
		var parentStage = getStageByLabel(parentLabelToPrune);
		var childStage = getStageByLabel(childLabel);

		markAllCandidateParentsForPerformanceTreeRemoval(parentStage);
		$.each(childStage.parentStages, function(i, parentLabel) {
			if (parentLabel !== parentLabelToPrune) {
				unmarkAllCandidateParentsForPerformanceTreeRemoval(getStageByLabel(parentLabel));
			}
		});

		var actionLabelsMarkedForRemoval = [];
		$.each(currentPractice.stages, function(i, stage) {
			if (stage.markForPerformanceTreeRemoval !== undefined) {
				if (stage.markForPerformanceTreeRemoval) {
					$.each(stage.actions, function(i, action) {
						actionLabelsMarkedForRemoval.push(action.label);
					});
					//Now that we've pushed it in the array, we don't need the markings
					delete stage.markForPerformanceTreeRemoval;
				}
			}
		});
		deleteActionLabelsFromPerformanceTree(childStage, actionLabelsMarkedForRemoval);

		//Now we need to propagate pruning all paths down from child stage
		var toActionLabelsForCut = [];
		var fromActionLabelsForCut = [];
		$.each(parentStage.actions, function(i, action) {
			fromActionLabelsForCut.push(action.label);
		});
		$.each(childStage.actions, function(i, action) {
			toActionLabelsForCut.push(action.label);
		});
		pruneCutFromStage(childStage, fromActionLabelsForCut, toActionLabelsForCut);

		//This is meant to capture a case where we're about to orphan a stage
		if (childStage.parentStages.length === 0) {
			$.each(childStage.actions, function(i, action) {
				if (action.performanceTree[action.label] === undefined) {
					action.performanceTree[action.label] = {
						"line": defaultPerformanceLine,
						"useDefault": true
					}
				}
			});
		}

		//NOTE: This is not the most rigorous solution, but we can imagine one...
		//Now we need to clean up the performance trees that don't end in their own label
		removeOrphanedParentStages(childStage);
	}
	var removeOrphanedParentStages = function(stage) {
		$.each(stage.actions, function(i, action) {
			removeOrphanedParents(action.performanceTree);
		});
		$.each(stage.nextStages, function(i, nextStageLabel) {
			removeOrphanedParentStages(getStageByLabel(nextStageLabel));
		});
	}
	var removeOrphanedParents = function(subtree) {
		$.each(subtree, function(key, value) {
			if (value instanceof Object) {
				removeOrphanedParents(value);
				if(isEmptyObject(value)) {
					delete subtree[key];
				}
			}
		});
	}

	var deleteActionFromAllPredecessors = function(stage, actionLabel) {
		$.each(stage.nextStages, function(i, nextStageLabel) {
			var nextStage = getStageByLabel(nextStageLabel);
			deleteActionLabelsFromPerformanceTree(nextStage, [actionLabel]);
			deleteActionFromAllPredecessors(nextStage, actionLabel);
		});
	}


	//This is meant to be private
	var pruneCutFromStage = function(stage, fromActionLabelsForCut, toActionLabelsForCut) {
		$.each(stage.actions, function(i, action) {
			pruneCutFromPerformanceTree(action.performanceTree, fromActionLabelsForCut, toActionLabelsForCut);
		});
		$.each(stage.nextStages, function(i, nextStageLabel) {
			pruneCutFromStage(getStageByLabel(nextStageLabel), fromActionLabelsForCut, toActionLabelsForCut);
		});
	}
	var pruneCutFromPerformanceTree = function(subtree, fromActionLabelsForCut, toActionLabelsForCut) {
		$.each(subtree, function(key, value) {
			if (value instanceof Object) {
				$.each(fromActionLabelsForCut, function(i, fromLabel) {
					if (key === fromLabel) {
						$.each(toActionLabelsForCut, function(j, toLabel) {
							if (value[toLabel] !== undefined) {
								delete value[toLabel];
							}
						});
					}
				});
				pruneCutFromPerformanceTree(value, fromActionLabelsForCut, toActionLabelsForCut);
			}
		});
	}

	//This is meant to be
	var pruneLeavesRecursively = function(subtree, actionLabelsToPrune) {
		$.each(subtree, function(key, value) {
			if (value instanceof Object) {
				if ($.inArray(key, actionLabelsToPrune) != -1) {
					delete subtree[key];
				} else {
					pruneLeavesRecursively(value, actionLabelsToPrune);
				}
			}
		});
	}
	var deleteActionLabelsFromPerformanceTree = function(stage, actionLabelsMarkedForRemoval) {
		$.each(stage.actions, function(i, action) {
			pruneLeavesRecursively(action.performanceTree, actionLabelsMarkedForRemoval);
		});
	}
	var markAllCandidateParentsForPerformanceTreeRemoval = function(stage) {
		stage.markForPerformanceTreeRemoval = true;
		$.each(stage.parentStages, function(i, parentLabel) {
			markAllCandidateParentsForPerformanceTreeRemoval(getStageByLabel(parentLabel));
		});
	}
	var unmarkAllCandidateParentsForPerformanceTreeRemoval = function(stage) {
		delete stage.markForPerformanceTreeRemoval;
		$.each(stage.parentStages, function(i, parentLabel) {
			unmarkAllCandidateParentsForPerformanceTreeRemoval(getStageByLabel(parentLabel));
		});
	}

	var getPerformanceTreeSequences = function(action) {
		var performanceTreeSequences = [];

		generatePerformanceTreeSequences(action.performanceTree, performanceTreeSequences, []);

		return performanceTreeSequences;
	}
	//This is meant to be private
	var generatePerformanceTreeSequences = function(subtree, performanceTreeSequences, subsequence) {
		$.each(subtree, function(key, value) {
			if (value instanceof Object) {
				var clonedSubsequence = subsequence.slice(0);
				clonedSubsequence.push(key);
				generatePerformanceTreeSequences(value, performanceTreeSequences, clonedSubsequence);
			} else {
				//This means we've finished a path
				if (key === "line") {
					performanceTreeSequences.push(subsequence);
				}
			}
		});
	}
	var getDefaultPerformanceLine = function() {
		return defaultPerformanceLine;
	};

	var getAllPossibleBindingsForARole = function(conditions, knownRoleBindings, role) {
		//var evaluateRule = function(conditions, knownRoleBindings, cast, runAll)
		//return {"success":true, "possibleRoleBindings":setOfAllTrueRoleBindings};
		var results = evaluateRule(conditions, knownRoleBindings, currentCast, true);
		var bindingsForTheRole = [];
		if (results.success) {
			$.each(results.possibleRoleBindings, function(i, binding) {
				$.each(binding, function(roleName, castMember) {
					if (roleName === role) {
						if ($.inArray(castMember, bindingsForTheRole) === -1) {//not in array already
							bindingsForTheRole.push(castMember);
						}
					}
				});
			});
		}
		return bindingsForTheRole;
	}


	/////////////////////////////////////////////////
	// NEW PERFORMANCE TREE UPDATE FUNCTIONALITY  //
	/////////////////////////////////////////////////


	var updateAllPerformanceTreesInPractice = function(practice) {
		practice = practice || getCurrentPractice();

		//Mark all stages as needing updating
		for (var stage of practice.stages) {
			stage.performanceTreesNeedsUpdate = true;
		}

		var leaves = findLeafStages(practice);

		for (var leafStage of leaves) {
			//console.log("LEAF stage: " + leafStage.label);
			updateStageAndDependencies(leafStage);
		}

		//Mark all stages as needing updating
		for (var stage of practice.stages) {
			delete stage.performanceTreesNeedsUpdate;
		}
	}

	var findLeafStages = function(practice) {
		var leaves = [];
		for (var stage of practice.stages) {
			if (stage.nextStages.length === 0) {
				leaves.push(stage);
			}
		}
		return leaves;
	}

	/**
	 * @description This is meant to be private. This function assumes that it
	 * will never be called unless we've set performanceTreesNeedsUpdate. Once we
	 * are done with making the tree we will delete it.
		@param stage
	*/
	var updateStageAndDependencies = function(stage) {
		//Base case
		//console.trace();
		// console.log("^^^^^^^^^^updateStageAndDependencies for stage: " + stage.label);

		if (stage.parentStages.length === 0) {
			for (var action of stage.actions) {
				var label = action.label;
				var entryStagePerformanceTree = {};
				entryStagePerformanceTree[label] = { "line": defaultPerformanceLine, "useDefault": true};

				mergeTreeWithUpdatedSequencesWithExistingTree(action, entryStagePerformanceTree, action.performanceTree);
				stage.performanceTreesNeedsUpdate = false;
			}
			// console.log("[updateStageAndDependencies] Base case at entry stage: " + stage.label + " for action: " + action.label + "<stage>");
			// console.dir(stage);
			return;
		}

		//Tail recursion and merge all parent performance trees
		var mergedParents = {};
		for (var parentStageName of stage.parentStages) {
			var parentStage = getStageByLabel(parentStageName);

			updateStageAndDependencies(parentStage);

			for (var parentAction of parentStage.actions) {
				$.extend(true, mergedParents, parentAction.performanceTree);
			}
		}
		// console.log("[updateStageAndDependencies] all parents updated and merged for stage: " + stage.label + "<mergedParents>");
		// console.dir(mergedParents);

		//Merge our parent's performance tree into ours
		for (var action of stage.actions) {
			//0. Make copy of mergedParents for this action
			var copiedMergedParents = util.clone(mergedParents);
			//1. Append default performance to each leaf of mergedParents
			// console.log("alter leaves in merged parents to be default value at " + action.label + " <leaf*, copiedMergedParents>");
			for (var leaf of getPerformanceTreeLeaves(copiedMergedParents)) {
				//remove the previous content at that leaf.
				//leaf = {};
				leaf[action.label] = {
					"line": defaultPerformanceLine,
					"useDefault": true
				};
				// console.log(leaf);
			}
			//This function has a side effect: It copies all things we need into copiedMergedParents
			// console.log("<<<<<<<<<<<<<Beginning update for action " + action.label);
			// console.dir(action);
			mergeTreeWithUpdatedSequencesWithExistingTree(action, copiedMergedParents, action.performanceTree);
			// console.log(">>>>>>>>>>>>>Ending update for action " + action.label);
			// console.dir(action);

			action.performanceTree = copiedMergedParents;
		}
		stage.performanceTreesNeedsUpdate = false;
	}

	// var removeContentFromPerformanceTree = function removeContentFromPerformanceTree(subtree) {
	//
	// };

	//This is meant to be private
	var getPerformanceTreeLeaves = function(subtree) {
	  var performanceTreeLeaves = [];
	  for (var key in subtree) {
	    var value = subtree[key];
	    if (value.line !== undefined || Object.keys(value).length === 0) {
	      performanceTreeLeaves.push(value);
	      for (var innerKey in value) {
	        //This is meant to delete the 'line', 'useDefault' from the parent stages
	        delete value[innerKey];
	      }
	    } else {
	      performanceTreeLeaves = performanceTreeLeaves.concat(getPerformanceTreeLeaves(value));
	    }
	  }
	  return performanceTreeLeaves;
	};

	var mergeTreeWithUpdatedSequencesWithExistingTree = function(action, generatedSubtree, existingSubtree, sequence) {

		if(sequence === undefined) {
			sequence = {};
			//sequence[action.label] = {};
		}

		// console.log("[sequence]<sequence, generatedSubtree, existingSubtree> *****");
		// console.dir(sequence);
		// console.dir(generatedSubtree);
		// console.dir(existingSubtree);

		for (var generatedSubtreeKey in generatedSubtree) {
			if (existingSubtree[generatedSubtreeKey] !== undefined) {
				if (generatedSubtree[generatedSubtreeKey].line !== undefined) {
					//Generated is a leaf
					if (existingSubtree[generatedSubtreeKey].line !== undefined) {
						//Existing is a leaf
						generatedSubtree[generatedSubtreeKey] = util.clone(existingSubtree[generatedSubtreeKey]);

						//console.log("Both gen and existing are leaves. Take from existing: " +generatedSubtree[generatedSubtreeKey].line);
						//console.dir(sequence);
						//console.dir(generatedSubtree);
					} else {
						//console.log("Gen is a leaf but existing is not. Either quit or update from cache. <sequence, clonedSequence, cachableSubtree>");
						//update our sequence, it needs to be updated before caching or pulling
						//console.dir(sequence);
						var clonedSequence = util.clone(sequence);
						var toAppend = {};
						toAppend[generatedSubtreeKey] = {};
						appendToEndOfObjectSequence(clonedSequence, toAppend);

						//clonedSequence[generatedSubtreeKey] = {};
						//console.dir(clonedSequence);

						//We have move existing subtree than we need. So we cache.
						var cachableSubtree = util.clone(clonedSequence);
						appendToEndOfObjectSequence(cachableSubtree, existingSubtree[generatedSubtreeKey]);
						//cachableSubtree[generatedSubtreeKey] = existingSubtree[generatedSubtreeKey];
						cachePerformanceTree(action, cachableSubtree);
						//console.dir(cachableSubtree);

						//If there is something in the cache, use it in the generated
						var cachedPerfromanceObj = pullFromPerformanceTreeCache(action, clonedSequence);

						if (cachedPerfromanceObj !== undefined) {
							//console.log("Used line from performance tree cache");
							//console.dir(cachedPerfromanceObj);
							generatedSubtree[generatedSubtreeKey] = cachedPerfromanceObj;
						}
					}
				} else if (existingSubtree[generatedSubtreeKey].line !== undefined) {
					//Existing is a leaf and generated is not
					//Cache
					//console.log("Existing is a leaf and generated is not. Cache and continue.");
					var cachableSubtree = util.clone(sequence);
					cachableSubtree[generatedSubtreeKey] = existingSubtree[generatedSubtreeKey];
					cachePerformanceTree(action, cachableSubtree);

					var clonedSequence = util.clone(sequence);
					//clonedSequence[generatedSubtreeKey] = {};
					var toAppend = {};
					toAppend[generatedSubtreeKey] = {};
					appendToEndOfObjectSequence(clonedSequence, toAppend);
					mergeTreeWithUpdatedSequencesWithExistingTree(action, generatedSubtree[generatedSubtreeKey], existingSubtree[generatedSubtreeKey], clonedSequence);
				} else {
					//Neither are lines and sequence exists in both trees
					//console.log("Neither are lines and sequence exists in both trees");
					var clonedSequence = util.clone(sequence);
					var toAppend = {};
					toAppend[generatedSubtreeKey] = {};
					appendToEndOfObjectSequence(clonedSequence, toAppend);
					//clonedSequence[generatedSubtreeKey] = {};
					mergeTreeWithUpdatedSequencesWithExistingTree(action, generatedSubtree[generatedSubtreeKey], existingSubtree[generatedSubtreeKey], clonedSequence);
				}
			}
		}

		//This catches the case where the existing tree has contents, and the generated doesn't
		//In this case we want to cache.
		for (var existingSubtreeKey in existingSubtree) {
			if (generatedSubtree[existingSubtreeKey] === undefined) {
				//console.log("Key in existing tree but not in generated. Time to cache!");
				var cachableSubtree = util.clone(sequence);
				var toAppend = {};
				toAppend[existingSubtreeKey] = existingSubtree[existingSubtreeKey];
				appendToEndOfObjectSequence(cachableSubtree, toAppend);
				cachableSubtree[existingSubtreeKey] = existingSubtree[existingSubtreeKey];
				cachePerformanceTree(action, cachableSubtree);
			}
		}
	}

	var cachePerformanceTree = function(action, cachableSubtree) {
		action.performanceTreeCache = action.performanceTreeCache || {};
		$.extend(true, action.performanceTreeCache, cachableSubtree);
		return;
	}

	var pullFromPerformanceTreeCache = function(action, sequence) {
		//console.log("[" +action.label+ "] pullFromPerformanceTreeCache(): " + Object.keys(sequence)[0]);
		//console.dir(sequence);
		action.performanceTreeCache = action.performanceTreeCache || {};
		var subtree = util.clone(action.performanceTreeCache);
		while (sequence !== undefined) {
			var keys = Object.keys(sequence);
			if (keys.length < 1 || subtree[keys[0]] === undefined) {
				return undefined;
			}
			sequence = sequence[keys[0]];
			subtree = subtree[keys[0]];
		}
		if (subtree.line !== undefined) {
			return subtree;
		}
		return undefined;
	}

	var appendToEndOfObjectSequence = function(sequence, toAppend) {
		var keys = Object.keys(sequence);
		var key;
		var current = sequence;
		var previous = {};

		if(keys.length === 0) {
			return toAppend;
		}

		while(keys.length !== 0) {
			key = keys[0];
			previous = current;
			current = current[keys];
			keys = Object.keys(current);
		}

		previous[key] = toAppend;
	}

	return {
		evaluateRule: evaluateRule,
		testEvaluateRule: testEvaluateRule,
		launchStage: launchStage,
		getPractices: getPractices,
		setPractices: setPractices,
		setCast: setCast,
		addPractice: addPractice,
		removePractice: removePractice,
		getCurrentPractice: getCurrentPractice,
		getPracticeByName: getPracticeByName,
		setCurrentPractice: setCurrentPractice,
		getCurrentStage: getCurrentStage,
		setCurrentStage: setCurrentStage,
		getCurrentAction: getCurrentAction,
		setCurrentAction: setCurrentAction,
		getCurrentRoleBindings:getCurrentRoleBindings,
		getEventStageByLabel: getEventStageByLabel,
		getStageByLabel: getStageByLabel,
		getActionByLabel: getActionByLabel,
		getActionByLabelFromAnyPractice: getActionByLabelFromAnyPractice,
		getPossibleActions: getPossibleActions,
		generateActions: generateActions,
		selectAction: selectAction,
		instantiatePerformance: instantiatePerformance,
		setBestRoleBindingForAction: setBestRoleBindingForAction,
		applyEffects: applyEffects,
		stageTransition: stageTransition,
		inTerminalStage: inTerminalStage,
		getActionByName: getActionByName,
		getCloneOfBoundPredicates: getCloneOfBoundPredicates,
		getScoredMTInfo:getScoredMTInfo,
		getScoredActionsInfo:getScoredActionsInfo,
		deleteStage: deleteStage,
		updateStage: updateStage,
		updateActionPerformanceTrees: updateActionPerformanceTrees,
		updateActionLabelForAllPerformanceTrees: updateActionLabelForAllPerformanceTrees,
		pruneParentFromPerformanceTree: pruneParentFromPerformanceTree,
		getPerformanceTreeSequences: getPerformanceTreeSequences,
		getDefaultPerformanceLine: getDefaultPerformanceLine,
		getAllPossibleBindingsForARole: getAllPossibleBindingsForARole,
		deleteActionFromAllPredecessors: deleteActionFromAllPredecessors,
		deleteActionLabelsFromPerformanceTree: deleteActionLabelsFromPerformanceTree,
		updateAllPerformanceTreesInPractice: updateAllPerformanceTreesInPractice
	};
});
