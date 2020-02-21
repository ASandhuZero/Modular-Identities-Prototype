define(["jquery", "practiceManager", "sfdb", "cif"],
function ($, practiceManager, sfdb, cif) {
  var dialogue = [];
  var initiator = "";
  var responder = "";

  var generateInteraction = function(initiator, responder, action)
  {
    //Perform  action
    practiceManager.setBestRoleBindingForAction(action, cif.getCharacters());
    //Apply effect of player action (if there are any)
    practiceManager.applyEffects();

    var dialogue = practiceManager.instantiatePerformance();
    practiceManager.stageTransition();

		return dialogue;
  }

	var chooseNPCAction = function()
  {
    practiceManager.generateActions(false);
    if (practiceManager.getPossibleActions().length === 0) {
      console.log("There were no actions available for the NPC to take. This shouldn't ever happen.");
    }

    // get NPCs choice of action
    var selectedAction = practiceManager.selectAction(cif.getCharacters(), practiceManager.getPossibleActions());

    return selectedAction;
  }

/* Parse the messages coming in from the game and do the appropriate
 * CiF actions based on the message
 */
  var parseMessage = function(socket, message) {

		// Initialize CiF
		if (message === 'Initialize')
		{
			initializeCiF();
			socket.write("Initialization complete");
		}

    // return current practice
    else if (message === 'GetPractice') {
      var curPractice = practiceManager.getCurrentPractice();
      var practice = {
        "practice": curPractice
      };
      console.log(JSON.stringify(practice));
      socket.write(JSON.stringify(practice));

    }

		// Get a list of the names of all the practices available
		else if (message === 'GetPracticeNames') {
      console.log("get practice names");

      // get list of Practice titles
      var practices = practiceManager.getPractices();
      // setup the json object to be what is expected by the client
      var practiceNames = {
        "names":[]
      };
      // fill out the json object with the practice names
      for (var i=0; i<practices.length; i++)
      {
        var practice = practices[i];
        practiceNames.names.push(practice.label);
      }

			// send back the practices names
			console.log(JSON.stringify(practiceNames));
			socket.write(JSON.stringify(practiceNames));
		}

		// set the practice to what was chosen by the client
		else if (message.includes('SetPractice'))
		{
			// get practice being set
			// string sent is "SetPractice <practicename>"
			var practiceChosen = message.substring('SetPractice '.length);
			console.log("Practice chosen is " + practiceChosen);

      // launch practice
      practiceManager.setCurrentPractice(practiceChosen);
      var currentPractice = practiceManager.getCurrentPractice();
      var stage = currentPractice.entryStage;

      // TODO: eventually we will need to pass along the character names, too
      if (initiator !== "" && responder !== "")
      {
        practiceManager.launchStage(stage, initiator, responder);
        practiceManager.generateActions(false);
  			socket.write("success");
      }
      else
      {
        console.log("Initiator and responder must be set before setting the practice");
        socket.write("error");
      }
		}

		// Get a list of names of all the actions available
		else if (message === 'GetActionNames')
		{
			console.log("get action names");
			// get list of available actions
      practiceManager.generateActions(false);
			var actions = practiceManager.getPossibleActions();
			console.log("actions are");
			console.log(actions);
			// set up JSON object for what the client is expecting
			var actionNames = {
				"names":[]
			};
			// fill out the JSON object
			for (var i=0; i<actions.length; i++)
			{
				actionNames.names.push(actions[i].label);
			}
			// send back the JSON object
			console.log(JSON.stringify(actionNames));
			socket.write(JSON.stringify(actionNames));
		}
    // Set the initiator
    else if (message.includes('SetInitiator'))
    {
      initiator = message.substring('SetInitiator '.length);
      console.log("Initiator set to " + initiator);
      socket.write('success');
    }
    // Set the responder
    else if (message.includes('SetResponder'))
    {
      responder = message.substring('SetResponder '.length);
      console.log("Responder set to " + responder);
      socket.write('success');
    }
		// Set the action chosen by the client
		else if (message.includes('SetAction'))
		{
			// string sent is "SetAction <actionname>"
			var action = message.substring('SetAction '.length);
			console.log("Action chosen is " + action);

			// TODO: We need to pass in the initiator and responder at some point
			// TODO: We need to make it so you can loop through stages instead of just one at a time
			var chosenAction = practiceManager.getActionByName(action);

			practiceManager.launchStage(practiceManager.getCurrentStage(), initiator, responder);

			dialogue.push(generateInteraction(initiator, responder, chosenAction));

			 if (!practiceManager.inTerminalStage())
			 {
  				// stageBeforeTransition = practiceManager.getCurrentStage();
  				// // figure out what action the responder will choose
  				practiceManager.launchStage(practiceManager.getCurrentStage(), responder, initiator);

  				dialogue.push(generateInteraction(responder, initiator, chooseNPCAction()));

        }

			socket.write("success");
		}

		// Get the dialogue associated with the chosen action and the NPC's response
		else if (message === 'GetDialogue')
		{
			console.log("Getting dialogue!");
			//Print logging info
			console.log(dialogue);
			// set up JSON object for what the client is expecting
			var dialogueLines = {
				"dialogue":[]
			};
			// fill out the JSON object
			for (var i=0; i<dialogue.length; i++)
			{
				dialogueLines.dialogue.push(dialogue[i]);
			}

			console.log(JSON.stringify(dialogueLines));
			socket.write(JSON.stringify(dialogueLines));

			dialogue = [];
			console.log("dialogue cleared");
		}

		// Get list of the names of all the practices available
		else if (message === 'GetPractices') {
			console.log("inside get practices");
			var practicesWithPracticeOuterLabel = [];
			var practicesWithoutPracticeOuterLabel = practiceManager.getPractices();
			for (var i=0; i<practicesWithoutPracticeOuterLabel.length; i++)
			{
				// set up the JSON how we want it to be sent, and fill it with info
				var practice = practicesWithoutPracticeOuterLabel[i];
				practicesWithPracticeOuterLabel.push({
					"practice": practice
				});
			}
			// send back the practices
			console.log(JSON.stringify(getPracticesJSON));
			socket.write(JSON.stringify(getPracticesJSON));
		}
    else if (message === 'IsTerminalStage') {
      var isTerminal = {
        "isTerminal": practiceManager.inTerminalStage()
      };
      console.log(JSON.stringify(isTerminal));
      socket.write(JSON.stringify(isTerminal));
    }

	}

  return {
    parseMessage: parseMessage
  }

});
