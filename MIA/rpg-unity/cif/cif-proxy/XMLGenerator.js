define(["jquery", "practiceManager", "cif", "sfdb"], function ($, practiceManager, cif, sfdb) {

  var currentSide = 'right';

  var setCurrentSide = function(side)
  {
    side = side.toLowerCase();
    if (side !== 'left' && side !== 'right')
    {
      console.log("trying to set side incorrectly, should be 'left' or 'right' only. Being set to: " + side);
    }
    else
      currentSide = side;
  }

  var hideCharacterGraphicsXML = function() {

    if (characterShown !== 'none')
    {
      characterGraphics = characterInfo[characterShown].graphics;

      // hide the body (under the floorboards)
      bodyString = '<hide asset="body-' + characterGraphics.body + '" />\n';
      // hide face
      headString = '<hide asset="head-' + characterGraphics.head + '" />\n';
      // hide hair
      hairString = '<hide asset="hair-' + characterGraphics.hair + '" />\n';
      // hide nose
      noseString = '<hide asset="nose-' + characterGraphics.nose + '" />\n';
      // hide eyes
      eyesString = '<hide asset="eyes-' + characterGraphics.eyes + '" />\n';
      // hide mouth
      mouthString = '<hide asset="mouth-' + characterGraphics.mouth + '" />\n';
      characterXML 	= bodyString
                    + headString
                    + hairString
                    + noseString
                    + eyesString
                    + mouthString;
    }
    characterShown = 'none';
    return characterXML;
  }

  var generateCharacterGraphicsXML = function(character) {
    var character = typeof character === 'undefined' ? selectedCharacter : character;
    var characterXML = "";
    var bodyString = "";
    var headString = "";
    var hairString = "";
    var noseString = "";
    var eyesString = "";
    var mouthString = "";
    var characterGraphics = {};
    // switch to the opposite side we're currently on to give back and forth motion to characters
    var leftOrRightSide = currentSide === 'left' ? 'right' : 'left';
    currentSide = leftOrRightSide;

    var x = leftOrRightSide === 'right' ? '440px' : '30px';

    if (character !== characterShown)
    {
      // if a previous character was shown, we need to hide them
      if (characterShown !== "none")
      {
        characterGraphics = characterInfo[characterShown].graphics;

        // hide the body (under the floorboards)
        bodyString = '<hide asset="body-' + characterGraphics.body + '" />\n';
        // hide face
        headString = '<hide asset="head-' + characterGraphics.head + '" />\n';
        // hide hair
        hairString = '<hide asset="hair-' + characterGraphics.hair + '" />\n';
        // hide nose
        noseString = '<hide asset="nose-' + characterGraphics.nose + '" />\n';
        // hide eyes
        eyesString = '<hide asset="eyes-' + characterGraphics.eyes + '" />\n';
        // hide mouth
        mouthString = '<hide asset="mouth-' + characterGraphics.mouth + '" />\n';
      }

      // show graphics for selected character
      characterGraphics = characterInfo[character].graphics;
      characterShown = character;
      bodyString = bodyString + '<move asset="body-' + characterGraphics.body + '" x="' + x + '" />\n';
      bodyString = bodyString + '<show asset="body-' + characterGraphics.body + '" effect="fade" />\n';
      headString = headString + '<move asset="head-' + characterGraphics.head + '" x="' + x + '" />\n';
      headString = headString + '<show asset="head-' + characterGraphics.head + '" />\n';
      hairString = hairString + '<move asset="hair-' + characterGraphics.hair + '" x="' + x + '" />\n';
      hairString = hairString + '<show asset="hair-' + characterGraphics.hair + '" />\n';
      noseString = noseString + '<move asset="nose-' + characterGraphics.nose + '" x="' + x + '" />\n';
      noseString = noseString + '<show asset="nose-' + characterGraphics.nose + '" />\n';
      eyesString = eyesString + '<move asset="eyes-' + characterGraphics.eyes + '" x="' + x + '" />\n';
      eyesString = eyesString + '<show asset="eyes-' + characterGraphics.eyes + '" />\n';
      mouthString = mouthString + '<move asset="mouth-' + characterGraphics.mouth + '" x="' + x + '" />\n';
      mouthString = mouthString + '<show asset="mouth-' + characterGraphics.mouth + '" />\n';

      characterXML 	= bodyString
                    + headString
                    + hairString
                    + noseString
                    + eyesString
                    + mouthString;
    }
    return characterXML;
  }

  var createPracticeListScene = function(performanceString) {
    practiceManager.setCast(cif.getCharacters());
    // get list of practices available
    var practiceList = practiceManager.getPractices();

    var performanceXML = (typeof performanceString !== 'undefined')?performanceString:"";

    // modify xml to have a scene to enter
    var characterXML = generateCharacterGraphicsXML();
    var choiceXML = performanceXML + generateChoiceXML('practice', practiceList);
    var sceneName = sfdb.getCurrentTimeStep() + selectedCharacter + 'practice';

    addNewScene(sceneName, choiceXML, characterXML);
  }

  var addNewScene = function(sceneName, choiceXML, characterXML)
  {
  	var clearTextString = '<clear asset="tb_main" />';
  	var gotoString = '\n<goto scene="' + sceneName + '"/>\n';
  	// add goto to previous scene so it will go to our new scene
  	$(storyXML).find('wait').last().after(gotoString);

  	// add our new scene
  	var sceneString = '<scene id="' + sceneName +'">\n' + characterXML + clearTextString + choiceXML + '</scene>\n';
  	$(storyXML).find('scene').last().after(sceneString);
  }

  var generateChoiceXML = function(type, choices)
  {
  	var choiceXML = "<choice>\n";

  	for (var i = 0; i < choices.length; i++) {
  		var choice = choices[i].label;
  			choiceXML += '<option label="' + choice + '">\n';
  			choiceXML += '<passControlToCiF selection="' + type + '-' + choice + '"/>\n';
  			choiceXML += "</option>\n";
  		}

  		choiceXML += "</choice>\n";
  		choiceXML += '<wait/>\n';

  		return choiceXML;

  }

  var generateSceneXMLFromActions = function(availableActions) {
  	var availableActionNames = getNamesFromActions(availableActions);
  	var selectedPractice = practiceManager.getCurrentPractice().label;
  	var characterString = generateCharacterGraphicsXML();
  	var choiceString = generateChoiceXMLString(availableActions, selectedPractice,  0);
  	var newSceneId = sfdb.getCurrentTimeStep() + selectedCharacter + selectedPractice;
  	var clearTextString = '<clear asset="tb_main" />';
  	var gotoString = '\n<goto scene="' + newSceneId + '"/>\n';

  	addGotoCurrentSceneByString(gotoString);

  	var sceneString = '<scene id="' + newSceneId + '">\n' + characterString + clearTextString + choiceString + '</scene>\n';

  	return sceneString;
  }

  var getNamesFromActions = function(availableActions) {
  	var availableActionNames = [];
  	for (var actionCount = 0; actionCount < availableActions.length; actionCount++) {
  		availableActionNames.push(availableActions[actionCount].label);
  	}
  	return availableActionNames;
  }

  var generateChoiceXMLString = function(availableActions, selectedPracticeName, timeStep) {
  	var availableActionNames = getNamesFromActions(availableActions);
  	var choiceXML = "<choice>\n";

  	for (var actionCount = 0; actionCount < availableActionNames.length; actionCount++) {
  		var action = availableActionNames[actionCount];
  		choiceXML += '<option label="' + action + '">\n';
  		choiceXML += '<passControlToCiF selection="' + action + '"/>\n';
  		choiceXML += "</option>\n";
  	}

  	choiceXML += "</choice>\n";
  	choiceXML += '<wait/>\n';

  	return choiceXML;
  }

  var addGotoLastSceneByString = function(gotoString) {
  	// insert goto XML string to the end of the last scene
  	$(storyXML).find('wait').last().after(gotoString);
  }

  var addSceneToStoryXMLByString = function(sceneString) {
  	$(storyXML).find('scene').last().after(sceneString);
  }

  return {
    createPracticeListScene: createPracticeListScene,
    hideCharacterGraphicsXML: hideCharacterGraphicsXML,
    generateCharacterGraphicsXML: generateCharacterGraphicsXML,
    generateChoiceXML: generateChoiceXML,
    addGotoLastSceneByString: addGotoLastSceneByString,
    addSceneToStoryXMLByString: addSceneToStoryXMLByString,
    setCurrentSide: setCurrentSide,
    addNewScene: addNewScene
  }
});
