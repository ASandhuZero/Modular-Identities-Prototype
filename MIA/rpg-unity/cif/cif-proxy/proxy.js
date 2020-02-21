const amd = require('amdefine');
var requirejs = require('requirejs');
require('jquery');
requirejs.config({
	paths: {
		// Note that the file paths omit the ".js" from the filename.
		"underscore" : "./lib/underscore-min",
		"util": "./lib/util",
		"log": "./lib/log",
		"cif": "../src/CiF",
		"sfdb": "../src/SFDB",
		"volition": "../src/Volition",
		"ruleLibrary": "../src/RuleLibrary",
		"aunlg": "../src/AUNLG",
		"actionLibrary": "../src/ActionLibrary",
		"validate": "../src/Validate",
		"test": "../src/tests/Tests",
		"messages": "./messages",
		"setup": "./setup",
		"practiceManager" : "../src/PracticeManager"

	}
});


requirejs(['cif', 'practiceManager', 'sfdb', 'messages', 'setup', 'jquery'],
function(CiF, PracticeManager, SFDB, messages, setup, $){
	const net = require('net');

	const PORT = 4200;
	const HOST = '127.0.0.1';
	const THROTTLE = 2500;

	setup.initializeCiF();

	var server = net.createServer(function(socket) {
		//socket.write('Echo server\r\n');
		//socket.pipe(socket);
	//	initializeCiF();

		socket.on('end', socket.end);

		socket.on('data', function (data) {
			console.log("Get Data being called!");
				var jsonInfo = data.toString().trim();
				console.log("\"" + jsonInfo + "\"");
				messages.parseMessage(socket, jsonInfo);
			});

			socket.on('error', function(err) {
			 console.log(err);
			});

}).listen(PORT, HOST);

//	server.listen(PORT, HOST);
});
