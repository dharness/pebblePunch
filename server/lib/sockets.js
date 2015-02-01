var sockets = {};
var _sockets = {};

var _viewers = {};

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

sockets.addViewer = function(sourceSocket, destSocket){
	if (typeof _viewers[destSocket] == 'undefined') _viewers[destSocket] = [];
	_viewers[destSocket].push(_sockets[sourceSocket]);
	this.remove(sourceSocket);
}
sockets.get = function(socketId){
	var res = [];
	res.push(_sockets[socketId]);
	for (var i = 0; i< _viewers[socketId]; i++){
			res.push(_viewers[socketId][i]);		
	}
	return res;
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
		for(var i = 0; i< socket.length; i++){
			socket[i].emit('punch',strength);
		}
	}
}


module.exports = sockets;