var mongoose  	= require('mongoose');
var DeveloperAccount 	= require('../model/DeveloperAccounts');
var configDB = require('../config/database');
var database = {};

mongoose.connect(configDB.url);

database.save = function(ipAddr,smartId,jsonData,analyseMode, name){
	var circles = [];
	var boxes = [];
	for (var i =0; i< jsonData.length; i++){
		if(jsonData[i].type == "Circle"){
			// handle CIRCLE
			var circle = {};
			circle['center'] = {};
			circle['center'].x = jsonData[i].center.x;
			circle['center'].y = jsonData[i].center.y;
			circle['radius'] = jsonData[i].radius;
			//circle['center'].z = jsonData[i].center.z;
			circles.push(circle);
		} 
			else //if(type  == "Box")
		{
			// handle BOX;
			var box = {};
			box['tl'] = {};
			box['tl'].x = jsonData[i].tl.x;
			box['tl'].y = jsonData[i].tl.y;
			box['br'] = {};
			box['br'].x = jsonData[i].br.x;
			box['br'].y = jsonData[i].br.y;
			boxes.push(box);
		}
	}
	devAccount = new DeveloperAccount({
		watchId:smartId,
		ip:ipAddr,
		mode:analyseMode,
		holdoff:"500",
		activity:name,
		circleArray:circles,
		boxArray:boxes
	});
	devAccount.save();
}

database.retrieve = function(smartId, callback){
	DeveloperAccount.find({watchId:smartId}, function(err,docs){
		if(err) console.log(err);
		console.log(docs);
		callback(docs);
	});
}

module.exports = database;