define(["jquery", "practiceManager", "XMLGenerator", "logFile", "sfdb", "cif"], function ($, practiceManager, XMLGenerator, logFile, sfdb, cif) {
  // A command is given the XML element that triggered the command
  // and a reference to the interpreter object:
  var generatePlayerActionOptions = function(responder)
  {
    // find list of actions within the entry stage
    practiceManager.generateActions(false);
    var availableActions = practiceManager.getPossibleActions();
    if (availableActions.length === 0) {
      console.log("No actions were available for player to take. It could have something to do with the preconditions.");
    }

    // write out choice block for actions
    // modify xml to have a scene to enter
    //var characterXML = XMLGenerator.generateCharacterGraphicsXML();
    var choiceXML = XMLGenerator.generateChoiceXML('action', availableActions);
    var sceneName = sfdb.getCurrentTimeStep() + responder + practiceManager.getCurrentPractice().label;

    // add to XML file
    XMLGenerator.addNewScene(sceneName, choiceXML, "");
  }

  var generateInteraction = function(initiator, responder, action)
  {
    var chosenAction = typeof action === 'string' ? practiceManager.getActionByName(action) : action;
    //Perform  action
    practiceManager.setBestRoleBindingForAction(chosenAction, cif.getCharacters());
    //Apply effect of player action (if there are any)
    practiceManager.applyEffects();

    //Print logging info
    var currentAction = practiceManager.getCurrentAction();

    //Log that the action was chosen
    logFile.log("action", initiator + " selected action '" + currentAction.label + "'.", currentAction);

    var effects = practiceManager.getCloneOfBoundPredicates(currentAction.effects, practiceManager.getCurrentRoleBindings());
    $.each(effects, function(index, val) {
      logFile.log("effect", cif.predicateToEnglish(val).text, effects);
    });

    var initiatorActionXMLString = "";
    if (initiator !== 'player')
    {
      initiatorActionXMLString = XMLGenerator.generateCharacterGraphicsXML(initiator);
    }

    initiatorActionXMLString = initiatorActionXMLString + practiceManager.instantiatePerformance();
    //Log performance
    //logFile.log("performance", $('<div/>').text(initiatorActionXMLString).html());

    //Move to the stage the contains the initiator's chosen action
    practiceManager.stageTransition();
    return initiatorActionXMLString;
  }

  var launchSocialPractice = function(practice, initiator, responder)
  {
    var chosenPractice = typeof practice === 'string' ? practiceManager.getPracticeByName(practice) : practice;

    logFile.log("practice", initiator + " initiates practice: " + chosenPractice.label + " with " + responder + ".", {"initiator":initiator, "responder":responder});
    practiceManager.setCurrentPractice(chosenPractice);

    // user chose practice, find entry stage
    var currentPractice = practiceManager.getCurrentPractice();
    var stage = currentPractice.entryStage;

    practiceManager.launchStage(stage, initiator, responder);
    logFile.log("stage", initiator + " enters entry stage.", stage);

    if (initiator === 'player')
    {
      // generates a list of choices for the player and when player chooses,
      // launchSocialAction is called
      generatePlayerActionOptions(responder);
    }
    else {
      launchSocialAction(chooseNPCAction(), initiator, responder);
//      generateInteraction(initiator, chooseNPCAction());
    }
  }

  var chooseNPCAction = function()
  {
    practiceManager.generateActions(false);
    if (practiceManager.getPossibleActions().length === 0) {
      console.log("There were no actions available for the NPC to take. This shouldn't ever happen.");
    }

    // get NPCs choice of action
    var selectedAction = practiceManager.selectAction(cif.getCharacters(), practiceManager.getPossibleActions());

    logMTInfo();
    logPossibleActionsInfo();

    return selectedAction;
  }

  var launchSocialAction = function(action, initiator, responder)
  {
    var chosenAction = typeof action === 'string' ? practiceManager.getActionByName(action) : action;
    //practiceManager.setCurrentAction(action);
    //Store the current stage before transition for logging
    var stageBeforeTransition = practiceManager.getCurrentStage();

    practiceManager.launchStage(practiceManager.getCurrentStage(), initiator, responder);

    var initiatorActionXMLString = generateInteraction(initiator, responder, chosenAction);
    logFile.log("stage", "Transitioning from stage '" + stageBeforeTransition.label + "' to stage '" + practiceManager.getCurrentStage().label + "'.", practiceManager.getCurrentStage());
    //Log performance
    logFile.log("performance", $('<div/>').text(initiatorActionXMLString).html(), {"performance":initiatorActionXMLString});

    stageBeforeTransition = practiceManager.getCurrentStage();
    // figure out what action the responder will choose
    practiceManager.launchStage(practiceManager.getCurrentStage(), responder, initiator);

    var responderActionXMLString = generateInteraction(responder, initiator, chooseNPCAction()) //practiceManager.instantiatePerformance();
    logFile.log("stage", "Transitioning from stage '" + stageBeforeTransition.label + "' to stage '" + practiceManager.getCurrentStage().label + "'.",practiceManager.getCurrentStage());
    logFile.log("performance", $('<div/>').text(responderActionXMLString).html(), {"performance":responderActionXMLString});

    var nextPlayerChoicesXMLString = "";
    var kickBackXML = "";
    var hideGraphicsXML = "";
    var waitXML = "<wait/>";
    var showTextBoxXML = "";

    // call show textbox in the XML if we're starting a new practice
    if (!firstChoiceInPracticeMade) {
        firstChoiceInPracticeMade = true;
        showTextBoxXML = "<show asset='tb_main'/>\n<clear asset='tb_main' />\n";
    }

    if (practiceManager.inTerminalStage()){
        //This means that the practice is complete.
        firstChoiceInPracticeMade = false;

        console.log("Practice complete.");
        hideGraphicsXML = "<hide asset='tb_main'/>\n";
        // check whether this is the Leave practice or not
        // TODO: This really shouldn't be hardcoded to the name. Do something more elegant here
        if (initiator !== 'player' || practiceManager.getCurrentPractice().label === 'Leave')
        {
          // hide the character asset
          hideGraphicsXML = hideGraphicsXML + XMLGenerator.hideCharacterGraphicsXML();
          kickBackXML = "<returnToGameEngine/>\n";
        }
        else {
          // show list of practices
          XMLGenerator.createPracticeListScene(showTextBoxXML + initiatorActionXMLString + responderActionXMLString + hideGraphicsXML);
          return;
        }
    }
    var newSceneName = sfdb.getCurrentTimeStep() + responder + chosenAction.label;
    var gotoString = "<goto scene=\"" + newSceneName + "\" />";
  //  XMLGenerator.addGotoCurrentSceneByString(gotoString);
    XMLGenerator.addGotoLastSceneByString(gotoString);

    //Note: kickBackXML will be set if the practice is complete
    var sceneString = "<scene id=\"" + newSceneName + "\">"
                        + showTextBoxXML
                        + initiatorActionXMLString
                        + responderActionXMLString
                        + nextPlayerChoicesXMLString
                        + hideGraphicsXML
                        + kickBackXML
                        + waitXML
                        + "</scene>";

    //Reset the global flag that we use to control when we see and don't see the textbox
    XMLGenerator.addSceneToStoryXMLByString(sceneString);

    if (!practiceManager.inTerminalStage() && initiator === 'player') {
      generatePlayerActionOptions(responder);
    }

  }

  return {
    launchSocialAction: launchSocialAction,
    launchSocialPractice: launchSocialPractice,
    chooseNPCAction: chooseNPCAction
  }
});
