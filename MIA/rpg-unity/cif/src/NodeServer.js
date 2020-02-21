var net = require('net');

var port = 2305;

var initialHandshake = {
  "type":"init"
};

var server = net.createServer(function(socket) {
    socket.write(initialHandshake);
    socket.pipe(socket);
});

server.listen(port);
