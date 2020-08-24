import * as AUNLG from "./../js/AUNLG.js";

let nlg = AUNLG();

class MIA {

    //TODO: Put this somewhere else. PlayerName is here just for testing
    playerName : string;
    actionList;

    identityDialogue;
    interface : object;

    
    timeStep : number;
    test : string;
    identityValues : object;
    identityDescription : object;
    cif;
    cast : string[];
    allowedIdentities : string[];

    constructor() {
        this.playerName = "";
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
    // Clean up this function
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
    getCharDialogue(char : string) {
        let dialogue : string;
        this.addActionTypePredicateToSFDB(char, "dialogue");
        let volitions = this.cif.calculateVolition(this.cast);
        let action = this.cif.getAction(char, char, volitions, this.cast);
        
        
        
        
        dialogue = action.performance;
        console.log(dialogue);
        return dialogue;
    }
    getCharPhysicalAction(char : string) {
        console.log("fill out this function")
        debugger
    }

    intentSelection(charVolition : object[], char: string, decisionType : string, storedVolitions){
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
        debugger;
        rankedIntents = this.rankIntents(intents);
        // Select dominant intent for right now
        // get action template from intent
        console.log(rankedIntents, "rankedIntents")
        intent = this.chooseIntent(rankedIntents);

        actions = this.cif.getActions(char, char, storedVolitions, this.cast, 2);
        //TODO extrapolate out this to two levels of reasoning so you don't have to overhaul all you reasoning in one location.
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
    //TODO: Right now this doesn't do anything but it will at some point. Currently offloading action decision making to TWINE
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
        // Set up actions as a two phase thing. Get one action file to choose which action to do. Then get back the identtiy information from CIF.
        // Honestly, this makes sense? Need to do some more building about this. Focus on this in the morning.

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

    //Blending identity actions together
    BlendIdentityActions() {

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
    getIdentities() {
        return {};
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
            castIdentityValues[character] = this.getIdentityValue(identityData, character);
            
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

    updateTimeStep(){
        this.timeStep = this.cif.setupNextTimeStep();
    }



    getPlayerIdentities() {
        let identities = {}
        return identities;
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