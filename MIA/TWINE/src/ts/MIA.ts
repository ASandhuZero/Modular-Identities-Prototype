// TODO: Cry to yourself because you know that you should be using interfaces
// with your objects and not just defaulting to any. One of these days I will
// clean it up.
class MIA {
    
    actionList : any;
    roleClasses : any;   
    roleDialogue : any;
    interface : object;
    roleTypes : object;
    playerName : string;
    
    AUNLG : any;
    timeStep : number;
    roleValues : object;
    roleDescription : object;
    cif : any;
    cast : string[];
    allowedRoleClasses : string[];
    
    constructor() {
        this.roleValues = {};
        this.roleDescription = {};
        this.cif = {};
        this.cast = [];
        this.allowedRoleClasses = [];
        this.timeStep = 0;
        this.interface = {};
        this.roleTypes = {};
    }
    /**
     * Tester function to get things up and running. Should be removed 
     * in the final cut of this code boy
     * @param identities_values 
     * @param identity_description 
     */
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
    /**
     * addLabelToSFDB. 
     * @param character A character from the cast of characters
     * @param label the label that we want to add.
     */
    addLabelToSFDB(character : string, label : string) {
        let actionToAdd : object = {
            "class": "SFDBLabelUndirected",
            "duration": 0,
            "first": character,
            "second": undefined,
            "timeHappened": this.timeStep,
            "type": label,
            "value": true
        }
        this.cif.set(actionToAdd);
    }
    blendRoleActions(actionBlend, actions) {
            console.log("in blend actions with the blend of ", actionBlend,
            "and the role actions of ", actions);
            let blend = actionBlend.blend;
            let roleList = blend.split(',');
            let performanceList = [];
            for (let i = 0; i < roleList.length; i++) {
            let role = roleList[i];
            if (actions[role] === undefined) {
                return undefined;
            }
        }
        
        let action = {
            "name" : "blendedAction",
            "role" : "Blend",
            "conditions" : [],
            "performance" : "",
            "influenceRules" : [],
            "effects" : [],
            "dialogue" : ""
        };
        for (let i = 0; i < roleList.length; i++) {
            let role = roleList[i];
            let actionList = actions[role];
            // Really need to figure out a better way to actually choose blend 
            // actions. Maybe use influence rules here?
            let actionToBlend = actionList[0]; //TODO: look above yo
            let blendConditions = actionToBlend.conditions;
            let blendRules = actionToBlend.influenceRules;
            let blendEffects = actionToBlend.effects;
            let blendPerformance = this.getPerformanceFromProcedure(actionToBlend);
            //TODO: here is where that work needs to happen.
            for (let condition in blendConditions) {
                action.conditions.push(blendConditions[condition]);
            }
            for (let rule in blendRules) {
                action.influenceRules.push(blendRules[rule]);
            }
            for (let effect in blendEffects) {
                action.effects.push(blendEffects[effect]);
            }
            performanceList.push(blendPerformance);
        }
        action.performance = performanceList.join(" ")
        return action;
    }
    //TODO: Please for the love of God, clean up this function.
    blendProcedureActions(actionBlend, actions) {
        console.log("in blend actions with the blend of ", actionBlend,
        "and the role actions of ", actions);
        let blend = actionBlend.blend;
        let procedureList = blend.split(',');
        let performanceList = [];
        let procedureMapping = {}
        //TODO: Make function to put the action data in as the procedure as key 
        // rather than doing it this way.
        for (let role in actions) {
            let roleActionsList = actions[role];
            for (let i = 0; i < roleActionsList.length; i++) {
                let roleAction = roleActionsList[i];
                let actionProcedures = roleAction.procedure;
                if (actionProcedures === undefined) {
                    continue;
                }
                for (let index = 0; index < actionProcedures.length; index++) {
                    let procedureComponent = actionProcedures[index];
                    if (procedureMapping[procedureComponent] === undefined) {
                        procedureMapping[procedureComponent] = [];
                    } 
                    procedureMapping[procedureComponent].push(roleAction);
                }
            }
        }
        console.log("the procedure Mapping is", procedureMapping);
        //TODO: Need to have some kind of escape maybe?
    
        let action = {
            "name" : "blendedAction",
            "role" : "Blend",
            "conditions" : [],
            "performance" : "",
            "influenceRules" : [],
            "effects" : [],
            "dialogue" : ""
        };
        for (let i = 0; i < procedureList.length; i++) {
            console.log("we are in the procedure loop!")
            let procedureKey = procedureList[i];
            let actionList = procedureMapping[procedureKey];
            if (actionList === undefined) {
                continue;
            }
            let randIndex = Math.floor(Math.random() * Math.floor(actionList.length));
            let actionToBlend = actionList[randIndex]; //TODO: make it better blend procedure
            let performanceBlend = actionToBlend.performance[procedureKey];
            console.log("The action to blend is!", actionToBlend);
            let blendConditions = actionToBlend.conditions;
            let blendRules = actionToBlend.influenceRules;
            let blendEffects = actionToBlend.effects;
            //TODO: here is where that work needs to happen.
            for (let condition in blendConditions) {
                action.conditions.push(blendConditions[condition]);
            }
            for (let rule in blendRules) {
                action.influenceRules.push(blendRules[rule]);
            }
            for (let effect in blendEffects) {
                action.effects.push(blendEffects[effect]);
            }
            performanceList.push(performanceBlend);
        }
        
        action.performance = performanceList.join(" ");
        console.log("The output for procedure blend is!", action);
        return action;
    }
    blendActions(actionBlend, actions) {
        let action : any;
        
        if (actionBlend.blendType === "role") {
            action = this.blendRoleActions(actionBlend, actions);
            console.log("The role blend was chosen!, and here is the" +
                " output!", action);
        }
        if (actionBlend.blendType === "procedure") {
            action = this.blendProcedureActions(actionBlend, actions);
            console.log("The procedure blend was chosen!, and here is the" +
               " output!", action);
        }
        return action;
        
    }
    generateCharDialogue(talkingChar : string, listeningChar : string) {
        let dialogue : string;
        this.addLabelToSFDB(talkingChar, "dialogue");
        
        let volitions = this.cif.calculateVolition(this.cast);
        let action : any;
        action = this.cif.getAction(talkingChar, listeningChar, volitions, this.cast);
        let performance = this.getPerformanceFromProcedure(action);
        let pdialogue = performance;
        // TODO: Save this somewhere whenever the game starts up and then edit 
        // it as time goes on 
        let charData = this.cif.getCharactersWithMetadata();
        let talkingCharData = charData[talkingChar];
        let listeningCharData = charData[listeningChar];
        if (listeningChar === "player") {
            listeningCharData.name = this.playerName;
        }
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
    selectIntents(charVolition : object[], char: string, storedVolitions) {
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
    setCiF(cif, roles : string[]) {
        this.cif =  cif;
        this.cast = cif.getCharacters();
        this.setActions(cif);
        this.allowedRoleClasses = roles;
    }

    setAUNLG(AUNLG) {
        this.AUNLG = AUNLG;
    }
    
    getRoleValues() {
        return this.roleValues;
    }
    setRoleValues(roleValue : object) {
        this.roleValues = roleValue;
    }
    getroleDescriptions() {
        return this.roleDescription;
    }
    setroleDescriptions(roleDescription : object) {
        this.roleDescription = roleDescription;
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
    getRoleTypes() {
        return this.roleTypes;
    }
    setRoleTypes(roleTypes) {
        this.roleTypes = roleTypes;
    }

    getRoleTypesValue(roleClasses) {
        let roleKeys = mia.getRoleClasses();
        let roleTypes = mia.getRoleTypes()
        let playerRoles = {};
        let formattedRoleTypeList = [];
        for (let i = 0; i < roleKeys.length; i++) {
            let roleKey = roleKeys[i];
            if (roleClasses[roleKey]) {
                let roleTypeList = roleTypes[roleKey];
                let formattedRoleTypes = {};
                for (let j = 0; j < roleTypeList.length; j++) {
                    let roleType = roleTypeList[j];
                    let formattedRole = {
                        "roleType" : roleType,
                        "value" : false
                    }
                    formattedRoleTypeList.push(formattedRole);
                }
                playerRoles[roleKey] = formattedRoleTypeList;
                formattedRoleTypeList = [];
            }
        }
        return playerRoles;
    }
    // Clean up this function THIS FUNC BROKE BAD. 
    // TODO: CLEAN UP THIS OIL SPILL OF A FUNCTION
    // TODO: This should be a util function.
    // I don't think I even use this for anything?
    getCastActionsWithLabel(decisionType : string, environmentInfo : object) {
        let castActions : object = {};
        for (let i = 0; i < this.cast.length; i++) {
            this.addLabelToSFDB(this.cast[i], decisionType);
        }
        let storedVolitions = this.cif.calculateVolition(this.cast);
        let volitions : object[] = []
        for (let i = 0; i < this.cast.length; i ++) {
            let char : string = this.cast[i];
            let action : object = {};
            action = this.cif.getAction(char, char, storedVolitions, this.cast);
         
            castActions[char] = action;
        }
        // CIF gets volitions
        // MIA picks the highest identity
        //  if dialogue, NLG and MIA
        //  if action use CIF
        // identity and dialoguetype used together to NLG dialogue
        return castActions;
    }
    /**
     * This function should reflect all the player choices in a given 
     * scene. This means a hierarchial approach of dialogue and physical 
     * actions are needed here. 
     * @param player The player character name 
     * @param char The cast character the player is interacting with.
     */
    generatePlayerActions(player : string, char : string ) {
        let roleActions = {};
        let dialogueActions = {};
        let physicalActions = {};
        let procedureComponentActions = {};
        let actionBlendList = [];
        let playerActions : any[];
        let actionReturnList = [];
        let shouldBlend = false;
        let actionType = "dialogue";
        
        let volitions = this.cif.calculateVolition(this.cast);
        playerActions = this.cif.getActions(player, char, volitions, this.cast, 
            5, 5, 5);

    
        let castData = this.cif.getCharactersWithMetadata();
        let playerData = castData[player];
        let charData = castData[char];
        //This for loop is doing two things. 
        // 1. Checking to see if a blend should happen from thee player actions.
        // 2. Processing the dialogue text (I think this can be broken out into 
        // a function.
        for (let i = 0; i < playerActions.length; i++) {
            
            let action = playerActions[i];
            // checking if should blend
            if (action.type === "blend") {
                shouldBlend = true;
                actionBlendList.push(action);
                continue;
            }
            if (actionType === "dialogue") {                
                // parsing out the dialogue from action. 
                // I feel like this should only happen if the action is for dialogue
                let performance = this.getPerformanceFromProcedure(action);
                let pdialogue = performance;
                let locutionData = this.AUNLG.preprocessDialogue(pdialogue);
                let dialogue = this.renderText(locutionData, playerData, charData);
                action.dialogue = dialogue;
                let role = undefined;
                if (action.role !== undefined) {
                    role = action.role;
                    if (roleActions[role] === undefined) {
                        roleActions[role] = [];
                    } 
                    roleActions[role].push(action);
                }
                actionReturnList.push(action);
            }
        }
        if (shouldBlend) {
            for (let i = 0; i < actionBlendList.length; i++) {
                let actionBlend = actionBlendList[i];
                console.log("A blend should happen!");
                let blendAction = this.blendActions(actionBlend, roleActions);
                if (blendAction !== undefined) {
                    if (blendAction.performance !== "") {
                        let pdialogue = blendAction.performance;
                        let locutionData = this.AUNLG.preprocessDialogue(pdialogue);
                        let dialogue = this.renderText(locutionData, 
                            playerData, charData);
                            blendAction.dialogue = dialogue;
                            actionReturnList.push(blendAction);
                    }
                }
            }
        }
        return actionReturnList;
    }
 

    getPerformanceFromProcedure(action) {
        if (action.procedure.length === 1) {
            let procedure = action.procedure[0];
            return action.performance[procedure];
        }
        let performanceList = [];
        let procedure = action.procedure;
        for (let i = 0; i < procedure.length; i++) {
            console.log(procedure[i]);
            let component = action.performance[procedure[i]]
            performanceList.push(component);
        }
        let performance = performanceList.join(' ');
        return performance;
    }
    getplayerRoles() {
        let identities = {}
        let socialStructure = this.cif.getSocialStructure();
        console.log(this.roleClasses);
        for (let i = 0; i < this.roleClasses.length; i++) {
            let identity = this.roleClasses[i];
            identities[identity] = socialStructure[identity];
        }
        return identities;
    }
    setActionEffects(action) {
        for (let i = 0; i < action.effects.length; i++) {
            this.cif.set(action.effects[i]);
        }
    }
    getRoleClasses() {
        return this.roleClasses;
    }
    setRoleClasses(identities : any) {
        this.roleClasses = identities;
    }

    setRoleDialogue(roleDialgue : object) {
        this.roleDialogue = roleDialgue;
    }



    UpdatePlayer(gameData) {
        let playerName = gameData.name;
        this.playerName = name;
        let role = {};
        console.log(gameData);
        role = {
            "class" : "hero",
            "type" : "chosen one",
            "first" : "player",
            "value" : 50
        }
        debugger;
    }
}

let mia = new MIA();



let roleDialgue = {
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

mia.setRoleDialogue(roleDialgue);

let roleDescription = {
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

mia.setroleDescriptions(roleDescription);
//TODO: This should come from the schema. Please fix this you nerd.
let identityValues = {
    "hero" : false,
    "smith" : false,
    "mage" : false,
    "tank" : false
}
mia.setRoleValues(identityValues);

event = document.createEvent('Event');
event.initEvent('MIA', true, true);
document.dispatchEvent(event);