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
	if(typeof _viewers[socketId] !=='undefined'){
		for (var i = 0; i< _viewers[socketId].length; i++){
				res.push(_viewers[socketId][i]);		
		}
	}
	return res;
}
sockets.extractSessionId = function(socket, type){
	//get IP
	return socket.handshake.address;
}

sockets.send = function (target, data, action){
	//default strength
		var socket = this.get(target);
		console.log(socket.length);
		for(var i = 0; i< socket.length; i++){
			if(typeof socket[i] !== 'undefined') socket[i].emit(action,data);
		}
}


module.exports = sockets;