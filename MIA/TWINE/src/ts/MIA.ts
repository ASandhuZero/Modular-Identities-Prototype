//TODO: WE ARE HERE NOW. Use CiF to actually tally up volition scores and then pass them on to MIA.
// Get volitions from CIF.
// Use MIA to decide actions and what to say.
// Need CiF history data for identity values and CiF intent data for choosing action

class MIA {

    //TODO: Put this somewhere else. PlayerName is here just for testing
    playerName : string;
    actionList;

    timeStep : number;
    test : string;
    identityValues : object;
    identityDescription : object;
    cif;
    cast : string[];

    constructor() {
        this.playerName = "";
        this.timeStep = 0;
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



    getCastActions(decisionType : string) {
        let storedVolitions = this.cif.calculateVolition(this.cast);
        let rawVolitions : object = storedVolitions.dump();
        let volitions : object[] = []
        for (let i = 0; i < this.cast.length; i ++) {
            let char = this.cast[i];
            this.addActionCondition(char, decisionType);
            let charVolition = rawVolitions[char][char];
            this.intentSelection(charVolition, char, decisionType);
        }
        return volitions;
    }

    intentSelection(charVolition : object[], char: string, decisionType : string){
        let intents : object[];
        let rankedIntents : object;
        let intent : string;
        let action : object;
        let actionSymbols;

        
        // Get all identities active within character solved by the first part
        // Get all intents from the identities
        intents = this.scoreIntents(charVolition);
        // Rank Intents
        rankedIntents = this.rankIntents(intents);
        // Select dominant intent for right now
        // get action template from intent
        intent = this.chooseIntent(rankedIntents)
        //TODO extrapolate out this to two levels of reasoning so you don't have to overhaul all you reasoning in one location.
        action = this.chooseAction(decisionType);
        // fill in action template 
        actionSymbols = this.chooseActionSymbols(action);
        // return action
        return actionSymbols;
    }

    //TODO maybe we don't need this functioon so we might want to remove it? 
    scoreIntents(charVolition : object[]) {
        return charVolition; 
    }

    rankIntents(intents : object[]) {
        let rankedIntents : object = {};
        for (let i = 0; i < intents.length; i++) {
            let intent = intents[i];
            rankedIntents[intent["type"]] = intent["weight"];
        }
        return rankedIntents;
    }

    chooseIntent(rankedIntents : object) {
        let intent : string = "" 
        let maxWeight : number = 0;
        for (let key in rankedIntents) {
            if (rankedIntents[key] > maxWeight) {
                intent = key;
                maxWeight = rankedIntents[key];
            }
        }

        return intent
    }

    chooseAction(intent : string) { 
        console.log(intent);
        return {}
    }

    chooseActionSymbols(action : object) {
        return {}
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

    greet() {
        return "hello" + this.test;
    }

    setActions(cif) {
        let labels = cif.getSocialStructure()["SFDBLabelUndirected"];
        this.actionList = [];
        for (let label in labels) {
            this.actionList.push(label);
        }
    }

    setCiF(cif : object) {
        this.cif =  cif;
        this.cast = this.cif.getCharacters();
        this.setActions(cif);
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

    addActionCondition(character : string, action : string) {
        let history = [];
        let actionToAdd : object = {
            "class": "SFDBLabelUndirected",
            "duration": 0,
            "first": character,
            "second": undefined,
            "timeHappened": this.timeStep,
            "type": action,
            "value": true
        }

        for (let i = 0; i < this.timeStep; i++) {
            history[i] = {
                "pos" : i, 
                "data" : this.cif.get(i)
            }
        }
        let historyslice = this.cif.get(this.timeStep);
        historyslice.push(actionToAdd);
        history[this.timeStep] = {
            "pos" : this.timeStep,
            "data" : historyslice   
        }
        this.cif.addHistory({"history" : history});
    }



}

let mia = new MIA();


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