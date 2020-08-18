//TODO: WE ARE HERE NOW. Use CiF to actually tally up volition scores and then pass them on to MIA.
// Get volitions from CIF.
// Use MIA to decide actions and what to say.
// Need CiF history data for identity values and CiF intent data for choosing action
var MIA = /** @class */ (function () {
    function MIA() {
        this.playerName = "";
        this.timeStep = 0;
    }
    MIA.prototype.evaluateIdentities = function (identities_values, identity_description) {
        var arr = [];
        var descriptions = {
            "cons": [],
            "pros": []
        };
        for (var identity in identities_values) {
            if (identities_values[identity] != 0) {
                arr.push(identity);
            }
        }
        for (var i = 0; i < arr.length; i++) {
            var cons = identity_description[arr[i]]["cons"];
            var pros = identity_description[arr[i]]["pros"];
            descriptions["cons"] = descriptions["cons"].concat(cons);
            descriptions["pros"] = descriptions["pros"].concat(pros);
        }
        return descriptions;
    };
    MIA.prototype.getCastActions = function (decisionType) {
        for (var i = 0; i < this.cast.length; i++) {
            this.addActionCondition(this.cast[i], decisionType);
        }
        var storedVolitions = this.cif.calculateVolition(this.cast);
        var rawVolitions = storedVolitions.dump();
        var volitions = [];
        for (var i = 0; i < this.cast.length; i++) {
            var char = this.cast[i];
            var charVolition = rawVolitions[char][char];
            this.intentSelection(charVolition, char, decisionType);
            // this.cif.getAction();
            console.log(rawVolitions);
            var action = this.cif.getActions(char, char, storedVolitions, this.cast, 2);
            console.log(action, char);
        }
        return volitions;
    };
    MIA.prototype.intentSelection = function (charVolition, char, decisionType) {
        var intents;
        var rankedIntents;
        var intent;
        var action;
        var actionSymbols;
        // Get all identities active within character solved by the first part
        // Get all intents from the identities
        intents = this.scoreIntents(charVolition);
        // Rank Intents
        console.log(intents);
        rankedIntents = this.rankIntents(intents);
        // Select dominant intent for right now
        // get action template from intent
        intent = this.chooseIntent(rankedIntents);
        //TODO extrapolate out this to two levels of reasoning so you don't have to overhaul all you reasoning in one location.
        action = this.chooseAction(decisionType);
        // fill in action template 
        actionSymbols = this.chooseActionSymbols(action);
        // return action
        return actionSymbols;
    };
    //TODO maybe we don't need this functioon so we might want to remove it? 
    MIA.prototype.scoreIntents = function (charVolition) {
        return charVolition;
    };
    MIA.prototype.rankIntents = function (intents) {
        var rankedIntents = {};
        for (var i = 0; i < intents.length; i++) {
            var intent = intents[i];
            rankedIntents[intent["type"]] = intent["weight"];
        }
        return rankedIntents;
    };
    MIA.prototype.chooseIntent = function (rankedIntents) {
        var intent = "";
        var maxWeight = 0;
        for (var key in rankedIntents) {
            if (rankedIntents[key] > maxWeight) {
                intent = key;
                maxWeight = rankedIntents[key];
            }
        }
        return intent;
    };
    //TODO: Right now this doesn't do anything but it will at some point. Currently offloading action decision making to TWINE
    MIA.prototype.chooseAction = function (intent) {
        console.log(intent);
        return {};
    };
    MIA.prototype.chooseActionSymbols = function (action) {
        return {};
    };
    //get the action that an identity needs.
    MIA.prototype.getIdentityAction = function () {
    };
    //Blending identity actions together
    MIA.prototype.BlendIdentityActions = function () {
    };
    MIA.prototype.SelectIntent = function (identities) {
        return ["placeholder"];
    };
    MIA.prototype.greet = function () {
        return "hello" + this.test;
    };
    MIA.prototype.setActions = function (cif) {
        var labels = cif.getSocialStructure()["SFDBLabelUndirected"];
        this.actionList = [];
        for (var label in labels) {
            this.actionList.push(label);
        }
    };
    MIA.prototype.setCiF = function (cif) {
        this.cif = cif;
        this.cast = this.cif.getCharacters();
        this.setActions(cif);
    };
    MIA.prototype.getIdentities = function () {
        return {};
    };
    MIA.prototype.getIdentityValues = function () {
        return this.identityValues;
    };
    MIA.prototype.setIdentityValues = function (identitiesValues) {
        this.identityValues = identitiesValues;
    };
    MIA.prototype.getIdentityDescriptions = function () {
        return this.identityDescription;
    };
    MIA.prototype.setIdentityDescriptions = function (identityDescription) {
        this.identityDescription = identityDescription;
    };
    MIA.prototype.getDescriptions = function (identities_values, identity_description) {
        var arr = [];
        var descriptions = {
            "cons": [],
            "pros": []
        };
        for (var identity in identities_values) {
            if (identities_values[identity] != 0) {
                arr.push(identity);
            }
        }
        for (var i = 0; i < arr.length; i++) {
            var cons = identity_description[arr[i]]["cons"];
            var pros = identity_description[arr[i]]["pros"];
            descriptions["cons"] = descriptions["cons"].concat(cons);
            descriptions["pros"] = descriptions["pros"].concat(pros);
        }
        return descriptions;
    };
    MIA.prototype.getIdentityValuesForCast = function (identities, history, cast) {
        var data = history["history"][this.timeStep]["data"];
        var castIdentityValues = {};
        var identityData = [];
        for (var i = 0; i < identities.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (data[j]["class"] === identities[i]) {
                    identityData.push(data[j]);
                }
            }
        }
        for (var i = 0; i < cast.length; i++) {
            var character = cast[i];
            castIdentityValues[character] = this.getIdentityValue(identityData, character);
        }
        return castIdentityValues;
    };
    MIA.prototype.getIdentityValue = function (identityData, character) {
        var identityValues = {};
        for (var i = 0; i < identityData.length; i++) {
            var data = identityData[i];
            if (data["first"] === character) {
                if (identityValues[data["type"]] === undefined) {
                    identityValues[data["type"]] = 0;
                }
                identityValues[data["type"]] += data["value"];
            }
        }
        return identityValues;
    };
    MIA.prototype.updateTimeStep = function () {
        this.timeStep = this.cif.setupNextTimeStep();
    };
    MIA.prototype.addActionCondition = function (character, action) {
        var history = [];
        var actionToAdd = {
            "class": "SFDBLabelUndirected",
            "duration": 0,
            "first": character,
            "second": undefined,
            "timeHappened": this.timeStep,
            "type": action,
            "value": true
        };
        for (var i = 0; i < this.timeStep; i++) {
            history[i] = {
                "pos": i,
                "data": this.cif.get(i)
            };
        }
        var historyslice = this.cif.get(this.timeStep);
        historyslice.push(actionToAdd);
        history[this.timeStep] = {
            "pos": this.timeStep,
            "data": historyslice
        };
        this.cif.addHistory({ "history": history });
    };
    return MIA;
}());
var mia = new MIA();
var identityDescription = {
    "hero": {
        "cons": ["bullheaded"],
        "pros": ["fearless"]
    },
    "blacksmith": {
        "cons": ["gruff"],
        "pros": ["hard working"]
    },
    "mage": {
        "cons": ["weak"],
        "pros": ["brilliant"]
    },
    "tank": {
        "cons": ["singleminded"],
        "pros": ["strong"]
    }
};
mia.setIdentityDescriptions(identityDescription);
var identityValues = {
    "hero": false,
    "blacksmith": false,
    "mage": false,
    "tank": false
};
mia.setIdentityValues(identityValues);
