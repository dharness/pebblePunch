var mongoose  	= require('mongoose');
var HighScore 	= require('../models/Score');
var configDB = require('../config/database');
var database = {};


mongoose.connect(configDB.url);

database.log = function(jsonData, callback){
	var scoreVal
	if(typeof jsonData.magX !== 'undefined') {
		scoreVal = Math.sqrt((jsonData.magX*jsonData.magX) +(jsonData.magY*jsonData.magY) +(jsonData.magZ*jsonData.magZ));
	} else {
		scoreVal = jsonData.magnitude;
	}
	var response = {};
	response['newHighScore'] = false;
	HighScore.count({_id: jsonData.id}, function (err, count) {
		if(!count){
			//first time
			var score = new HighScore({
				_id: jsonData.id,
				score: scoreVal
			});
			response['newHighScore'] = true;
			score.save(function(err){
						if(err) response['error'] = err;
					});
			getHighScore(response,score,function(response){
				callback(response);
			});
		} else {
			// get your last high score
			HighScore.findById(jsonData.id, function(err, oldHighScore) {
				//did you beat your high score?
				if(scoreVal > oldHighScore.score){
					response['newHighScore'] = true;
					oldHighScore.score = scoreVal;
					oldHighScore.updatedDate = Date.now();
					oldHighScore.save(function(err){
						if(err) response['error'] = err;
					});
				}
				getHighScore(response,oldHighScore,function(response){
					callback(response);
				});
			});
		}
	});
}

function getHighScore(response,scoreItem, callback){
	//get the high score and send it back
	response['personalHighScore'] = scoreItem.score;
	HighScore.count({	
						_id:{'$ne': scoreItem._id }, 
						score: {"$gte":scoreItem.score}
					},
		function (err, count) {
			response['Ranking'] = count +1;
			HighScore.findOne()
					 .sort('-score')  // give me the max
					 .exec(function (err, member) {
					 	 response['highScore'] = member.score;
					 	 callback(response);
					 });	 
		});
}

module.exports = database;