// TODO: Cry to yourself because you know that you should be using interfaces
// with your objects and not just defaulting to any. One of these days I will
// clean it up.
class MIA {
    
    actionList : any;
    identities : any;   
    identityDialogue : any;
    interface : object;
    
    AUNLG : any;
    timeStep : number;
    identityValues : object;
    identityDescription : object;
    cif : any;
    cast : string[];
    allowedIdentities : string[];
    
    constructor() {
        this.identityValues = {};
        this.identityDescription = {};
        this.cif = {};
        this.cast = [];
        this.allowedIdentities = [];
        this.timeStep = 0;
        this.interface = {
            "getCastActions" : this.getCastActions
        }
    }
    
    evaluateIdentities(identities_values : object, identity_description: object) {
        let arr = []
        let descriptions = {
            "cons" : [],
            "pros" : []
        }
        for (let identity in identities_values) {
            if (identities_values[identity] != 0) {
                arr.push(identity);
            }
        }
        for (let i = 0; i < arr.length; i++) {
            let cons = identity_description[arr[i]]["cons"];
            let pros = identity_description[arr[i]]["pros"];
            descriptions["cons"] = descriptions["cons"].concat(cons);
            descriptions["pros"] = descriptions["pros"].concat(pros);
        }
        return descriptions;
    }

    addActionTypePredicateToSFDB(character : string, actionType : string) {
        let actionToAdd : object = {
            "class": "SFDBLabelUndirected",
            "duration": 0,
            "first": character,
            "second": undefined,
            "timeHappened": this.timeStep,
            "type": actionType,
            "value": true
        }
        this.cif.set(actionToAdd);
    }
    // Clean up this function THIS FUNC BROKE BAD. 
    // TODO: CLEAN UP THIS OIL SPILL OF A FUNCTION
    getCastActions(decisionType : string, environmentInfo : object) {
        let castActions : object = {};
        for (let i = 0; i < this.cast.length; i++) {
            this.addActionTypePredicateToSFDB(this.cast[i], decisionType);
        }
        let storedVolitions = this.cif.calculateVolition(this.cast);
        let volitions : object[] = []
        for (let i = 0; i < this.cast.length; i ++) {
            let char : string = this.cast[i];
            let action : object = {};
            action = this.cif.getAction(char, char, storedVolitions, this.cast);
            
            // let charVolition = rawVolitions[char][char];
            // castActions[char] = this.intentSelection(charVolition, char, decisionType, storedVolitions);
            // let actions = this.getActions(decisionType);
            // let idClass = castActions[char]["intent"]["class"];
            // let type = castActions[char]["intent"]["type"];
            // castActions[char]["action"] = actions[idClass][type]["high"];
         
            castActions[char] = action;
        }
        // CIF gets volitions
        // MIA picks the highest identity
        //  if dialogue, NLG and MIA
        //  if action use CIF
        // identity and dialoguetype used together to NLG dialogue
        return castActions;
    }

    getPlayerChoices(player : string, npc : string ) {
        let roleActions = {};
        let actionBlend = {};
        let playerActions : any[];
        let shouldBlend = false;
        let blendAction : any[];
        this.addActionTypePredicateToSFDB(player, "dialogue");
        
        let volitions = this.cif.calculateVolition(this.cast);
        playerActions = this.cif.getActions(player, npc, volitions, this.cast, 
            3, 3, 3);

        let charData = this.cif.getCharactersWithMetadata();
        let talkingCharData = charData[player];
        let listeningCharData = charData[npc];
        
        for (let i = 0; i < playerActions.length; i++) {
            let action = playerActions[i];
            let pdialogue = action.performance;
            let locutionData = this.AUNLG.preprocessDialogue(pdialogue);
            let dialogue = this.renderText(locutionData, 
                talkingCharData, listeningCharData);
            playerActions[i].performance = dialogue;

            let role = undefined;
            if (action.role !== undefined) {
                role = action.role;
            }
            roleActions[role] = action;
            if (action.type === "blend") {
                shouldBlend = true;
                actionBlend = action;
            }
        }

        if (shouldBlend) {
            let blendAction = this.BlendActions(actionBlend, roleActions);
            playerActions.push(blendAction);
        }
        return playerActions;
        
    }
 
    //Blending identity actions together
    BlendActions(actionBlend, roleActions) {
        let blend = actionBlend.blend;
        let roleList = blend.split(',');
        let performanceList = [];

        let action = {
            "name" : "blendedAction",
            "conditions" : [],
            "performance" : "",
            "influenceRules" : [],
            "effects" : []
        };
        for (let i = 0; i < roleList.length; i++) {
            let role = roleList[i];
            let actionToBlend = roleActions[role];
            let blendConditions = actionToBlend.conditions;
            let blendRules = actionToBlend.influenceRules;
            let blendEffects = actionToBlend.effects;
            let blendPerformance = actionToBlend.performance;


            action.conditions.push(blendConditions);
            action.influenceRules.push(blendRules);
            action.effects.push(blendEffects);
            performanceList.push(blendPerformance);
        }
        action.performance = performanceList.join(" ")

        return action;
    }

    setActionEffects(action) {
        for (let i = 0; i < action.effects.length; i++) {
            this.cif.set(action.effects[i]);
        }
    }

    getCharDialogue(talkingChar : string, listeningChar : string) {
        let dialogue : string;
        this.addActionTypePredicateToSFDB(talkingChar, "dialogue");
        
        let volitions = this.cif.calculateVolition(this.cast);
        let action : any;
        action = this.cif.getAction(talkingChar, listeningChar, volitions, this.cast);
        
        let pdialogue = action.performance;
        let charData = this.cif.getCharactersWithMetadata();
        let talkingCharData = charData[talkingChar];
        let listeningCharData = charData[listeningChar];
        let locutionData = this.AUNLG.preprocessDialogue(pdialogue);
        dialogue = this.renderText(locutionData, talkingCharData, listeningCharData);
       
        this.setActionEffects(action);
        let time = this.cif.setupNextTimeStep();
        return dialogue;
    }


    renderText(locutionData, talkingCharData, listeningCharData ) {
        let renderedTextList = [];
        let renderedText = "";
        for (let i = 0; i < locutionData.length; i++) {
            if (locutionData[i]["rawText"] === "(name)") {
                renderedTextList.push(listeningCharData.name);
            } else if (locutionData[i]["rawText"] === "(his/her/their)") {
                renderedTextList.push("their");
            } else if (locutionData[i]["choices"] !== undefined) {
                renderedTextList.push(locutionData[i]["choices"].random());
            }
             else if(Object.keys(locutionData[i]).length === 1) {
                renderedTextList.push(locutionData[i].rawText);
            }

        }
        renderedText = renderedTextList.join("");
        return renderedText;
    }

    getCharPhysicalAction(char : string) {
        console.log("fill out this function")
        debugger
    }

    intentSelection(charVolition : object[], char: string, storedVolitions) {
        let intents : object[];
        let rankedIntents : object;
        let intent : object;
        let actions : object[];
        let action : object;
        let actionSymbols;
        
        // Get all identities active within character solved by the first part
        // Get all intents from the identities
        intents = this.scoreIntents(charVolition);
        // Rank Intents
        console.log(intents, "intents");
        rankedIntents = this.rankIntents(intents);
        // Select dominant intent for right now
        // get action template from intent
        console.log(rankedIntents, "rankedIntents")
        intent = this.chooseIntent(rankedIntents);

        actions = this.cif.getActions(char, char, storedVolitions, this.cast, 2);
        //TODO extrapolate out this to two levels of reasoning so you don't have 
        // to overhaul all you reasoning in one location.
        action = this.chooseAction(actions, intent);
        // fill in action template 
        actionSymbols = this.chooseActionSymbols(action);
        // return action
        return {
            "action" : actionSymbols,
            "intent" : intent
        };
    }

    //TODO maybe we don't need this functioon so we might want to remove it? 
    scoreIntents(charVolition : object[]) {
        return charVolition; 
    }

    rankIntents(intents : object[]) {
        let rankedIntents : object = {};
        for (let i = 0; i < intents.length; i++) {
            let intent = intents[i];
            rankedIntents[intent["type"]] = {
                "weight" : intent["weight"],
                "class" : intent["class"]
            };
        }
        return rankedIntents;
    }

    chooseIntent(rankedIntents : object) {
        let intent : object = {} 
        let maxWeight : number = 0;
        for (let key in rankedIntents) {
            if (rankedIntents[key]["weight"] > maxWeight) {
                intent["type"] = key;
                maxWeight = rankedIntents[key];
                intent["class"] = rankedIntents[key]["class"];
            }
        }

        return intent
    }
    //TODO: Right now this doesn't do anything but it will at some point. 
    // Currently offloading action decision making to TWINE
    chooseAction(actions : object[], intent : object) { 
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];
            let conditions = action["conditions"];
            for (let j = 0; j < conditions.length; j++) {
                let condition = conditions[j];
                if (condition["type"] === intent["type"]){
                    return action;
                }
            }
        }
        // Set up actions as a two phase thing. Get one action file to choose 
        // which action to do. Then get back the identtiy information from CIF.
        // Honestly, this makes sense? Need to do some more building about this. 
        // Focus on this in the morning.
        return {}
    }
    // This is currently not doing anything. 
    //TODO: Get this to do something
    chooseActionSymbols(action : object) {
        return action;
    }
    //get the action that an identity needs.
    getIdentityAction() {
        
    }



    SelectIntent(identities : object) {
        return ["placeholder"];
    }

    setActions(cif) {
        let labels = cif.getSocialStructure()["SFDBLabelUndirected"];
        this.actionList = [];
        for (let label in labels) {
            this.actionList.push(label);
        }
    }

    setCiF(cif, identities : string[]) {
        this.cif =  cif;
        this.cast = cif.getCharacters();
        this.setActions(cif);
        this.allowedIdentities = identities;
    }

    setAUNLG(AUNLG) {
        this.AUNLG = AUNLG;
    }
    
    getIdentityValues() {
        return this.identityValues;
    }
    setIdentityValues(identitiesValues : object) {
        this.identityValues = identitiesValues;
    }
    getIdentityDescriptions() {
        return this.identityDescription;
    }
    setIdentityDescriptions(identityDescription : object) {
        this.identityDescription = identityDescription;
    }
    getDescriptions(identities_values : object, identity_description : object) {
        var arr = []
        var descriptions = {
            "cons" : [],
            "pros" : []
        }
        for (let identity in identities_values) {
            if (identities_values[identity] != 0) {
                arr.push(identity);
            }
        }
        for (let i = 0; i < arr.length; i++) {
            let cons = identity_description[arr[i]]["cons"];
            let pros = identity_description[arr[i]]["pros"];
            descriptions["cons"] = descriptions["cons"].concat(cons);
            descriptions["pros"] = descriptions["pros"].concat(pros);
        }
        return descriptions;
    }


    getIdentityValuesForCast(identities : string[], history : object, cast : string[]) {
        let data = history["history"][this.timeStep]["data"];
        let castIdentityValues = {}
        let identityData = []
        for (let i = 0; i < identities.length; i++) {

            for (let j = 0; j < data.length; j++) {
                
                if (data[j]["class"] === identities[i]) {
                    identityData.push(data[j]);
                }
            }
        }
        for (let i = 0; i < cast.length; i++) {
            let character = cast[i];
            let identityValue = this.getIdentityValue(identityData, character);
            castIdentityValues[character] = identityValue;
            
        }
        return castIdentityValues;
    }
    getIdentityValue(identityData : object[], character : string) {
        let identityValues = {};
        for(let i = 0; i < identityData.length; i++) {
            let data = identityData[i];
            if (data["first"] === character) {
                if (identityValues[data["type"]] === undefined) {
                    identityValues[data["type"]] = 0;
                }
                identityValues[data["type"]] += data["value"];
            }
        }
        return identityValues;
    }

    updateTimeStep() {
        this.timeStep = this.cif.setupNextTimeStep();
    }



    getPlayerIdentities() {
        let identities = {}
        let socialStructure = this.cif.getSocialStructure();
        console.log(this.identities);
        for (let i = 0; i < this.identities.length; i++) {
            let identity = this.identities[i];
            identities[identity] = socialStructure[identity];
        }
        return identities;
    }

    getIdentities() {
        return this.identities;
    }
    setIdentities(identities : any) {
        this.identities = identities;
    }

    setIdentityDialogue(identityDialogue : object) {
        this.identityDialogue = identityDialogue;
    }

}

let mia = new MIA();



let identityDialogue = {
    "smith" : {
        "blacksmith" : {
            "low" : "Yeah, I apprentice at the local blacksmith",
            "medium" : "Ah yes, I am a hired on blacksmith at the local blacksmith",
            "high" : "Yes! I do own the local blacksmith"
        },
        "silversmith" : {
            "low" : "Yeah, I apprentice at the local silversmith",
            "medium" : "Ah yes, I am a hired on silversmith at the local silversmith",
            "high" : "Yes! I do own the local silversmith"
        }
    },
    "hero" : {
        "chosen one" : {
            "low" : "I am trying to learn how to be a good hero!",
            "medium" : "I rescued someone once!",
            "high" : "I am the hero of the land!"
        }
    }
}

mia.setIdentityDialogue(identityDialogue);

let identityDescription = {
    "hero" : {
        "cons" : ["bullheaded"],
        "pros" : ["fearless"]
    },
    "blacksmith" : {
        "cons" : ["gruff"],
        "pros" : ["hard working"]
    },
    "mage" : {
        "cons" : ["weak"],
        "pros" : ["brilliant"]
    }, 
    "tank" : {
        "cons": ["singleminded"],
        "pros" : ["strong"]
    }
}

mia.setIdentityDescriptions(identityDescription);
let identityValues = {
    "hero" : false,
    "blacksmith" : false,
    "mage" : false,
    "tank" : false
}
mia.setIdentityValues(identityValues);

event = document.createEvent('Event');
event.initEvent('MIA', true, true);
document.dispatchEvent(event);