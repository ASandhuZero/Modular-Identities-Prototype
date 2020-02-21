const fs = require('fs');
define(["jquery", "practiceManager", "sfdb", "cif"],
function ($, practiceManager, sfdb, cif) {

  var initializeCiF = function(){
		/**
		 * Initializes CiF
		 */
		 console.log("initialized");
		var loadResult = cif.init();
		//Load in our schema, cast, triggerRules and volitionRules, and actions.


			var rawSchema = cif.loadFile("../../data/schema.json");
			console.log("This is raw schema " + rawSchema);
		/**
		 * Loads the data in the schema into the social structure
		 */
		try {
	    var schema = cif.loadSocialStructure(rawSchema);
    } catch (e){
        debug.log(e);
    }

		/**
		 * Loads cast.json
		 */
		var rawCast = cif.loadFile("../../data/cast.json");

		/**
		 * Adds characters into the game's character cast
		 */
		var cast = cif.addCharacters(rawCast);

		practiceManager.setCast(cast);

		//console.log("Here is our cast! " , cast);


		var jsonFiles = function(dir) {
			var results = [];

			fs.readdirSync(dir).forEach(function(file) {
				file = dir + '/' + file;
				var stat = fs.statSync(file);
				if (stat && stat.isDirectory() && file.search(".json") != -1) {
					results = results.concat(jsonFiles(file));
				}else{
          results.push(file);
        }
			});
        //WTF Alex?!?
					return results;
	     };

				var url = "../../data/practices";

				jsonData = jsonFiles(url);
			//	console.log('length is ' + jsonData.length);
				for (i = 0; i < jsonData.length; i++) {
					console.log(jsonData[i]);
          if(jsonData[i].search(".json") != -1){
					     var rawPractice = cif.loadFile(jsonData[i]);
					     practiceManager.addPractice(rawPractice);
           }
				}

				url = "../../data/microtheories",

				jsonData = jsonFiles(url);

				for (i = 0; i < jsonData.length; i++) {
					//console.log(jsonData[i]);
					if(jsonData[i].search(".json") != -1) {
			       var rawRuleSet = cif.loadFile(jsonData[i]);
          }
					//console.log("FOUND RULE!");
					//console.dir(rawRuleSet);
				}
				cif.addRules(rawRuleSet);

		var rawHistory = cif.loadFile("../../data/history.json");
		var history = cif.addHistory(rawHistory);
	};


  return {
    initializeCiF: initializeCiF
  }

});
