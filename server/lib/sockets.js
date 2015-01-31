var sockets = {};
var _sockets = {};

// IP addressses are used to map 
sockets.save = function(socket, callback){
	if(typeof socket == 'object'){
		var socketName =  this.extractSessionId(socket);
		_sockets[socketName] = socket;
	} else {
		console.log(socket+' is not a valid socket');
	}
};
sockets.remove = function(socketId){
	delete _sockets[socketId];
}
sockets.get = function(socketId){
	return _sockets[socketId];
}
sockets.extractSessionId = function(socket, type){
	//get IP
	return socket.handshake.address;
}

sockets.punch = function (target, strength){
	//default strength
	if(typeof _sockets[target] !== 'undefined'){
		strength = typeof strength !== 'undefined' ? strength : 800;
		var socket = this.get(target);
		socket.emit('punch',strength);
	}
}


module.exports = sockets;