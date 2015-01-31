var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path'); 
var fs = require('fs');
var activeUsers = 0;
var ejs = require('ejs');
var port = 6113;
var mongoose  = require('mongoose');
var HighScore     = require('./models/Score');
var codeId = 1;


app.get('/',function(req,res){
	console.log("GET received");
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(chunk){
		console.log(data);
	});
	res.send('hello world.');
});
app.post('/',function(req,res){
	var data = '';
	console.log("POST received");
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		console.log(data);
		try{
			var jsonData = JSON.parse(data);
			var scoreVal = Math.sqrt((jsonData.magX*jsonData.magX) +(jsonData.magY*jsonData.magY) +(jsonData.magZ*jsonData.magZ));
			var response = {};
			response['newHighScore'] = false;
			HighScore.count({_id: jsonData.id}, function (err, count) {
				console.log(count);
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
						res.send(response);
					});
				} else {
					// get your last high score
					HighScore.findById(jsonData.id, function(err, oldHighScore) {
						console.log(scoreVal);
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
							res.send(response);
						});
					});
				}
				//res.send('{"highScore":100,"personalHighScore":50,"Ranking":5}');
			});
		} catch(err){
			console.log(err);
			res.send(err);
		}
	});
	
	
});

function getHighScore(response,scoreItem, callback){
	//get the high score and send it back
	console.log(response);
	response['personalHighScore'] = scoreItem.score;
	HighScore.count({	
						_id:{'$ne': scoreItem._id }, 
						score: {"$gte":scoreItem.score}
					},
		function (err, count) {
			console.log(count);
			response['Ranking'] = count +1;
			HighScore.findOne()
					 .sort('-score')  // give me the max
					 .exec(function (err, member) {
					 	 response['highScore'] = member.score;
					 	 callback(response);
					 });	 
		});
}



// ========= LOAD CONFIG AND LAUNCH ============= //
var configDB = require('./config/database');
mongoose.connect(configDB.url);
fs.exists('config/config.js',function(exists){
	if(exists){
		port = require('./config/config').port;
	} else {
		port = 6113;
	}
	http.listen(port, function(){
		console.log('starting on port:'+port);
	})
});