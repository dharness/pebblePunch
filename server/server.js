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

var sockets = require('./lib/sockets');


app.get('/',function(req,res){
	console.log("GET received");
	res.sendFile('view/index.html', {root: __dirname} );
});
app.get('/js/:var',function(req,res){
	res.sendFile('view/js/'+req.param('var'), {root: __dirname} );
});
app.get('/images/:var',function(req,res){
	res.sendFile('view/images/'+req.param('var'), {root: __dirname} );
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
			// RESPOND TO PUNCH
			var src		 = req.ip;
			sockets.punch(src);
			// LOG PUNCH
			var jsonData = JSON.parse(data);
			var scoreVal

			if(typeof jsonData.magX !== 'undefined') {
				scoreVal = Math.sqrt((jsonData.magX*jsonData.magX) +(jsonData.magY*jsonData.magY) +(jsonData.magZ*jsonData.magZ));
			} else {
				scoreVal = jsonData.magnitude;
			}
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

// ============= 		SOCKET SETUP	 	============= //
io.on('connection',function(socket){
	activeUsers++;
	console.log('active users:' + activeUsers);
	socket.on('disconnect', function(){
		activeUsers--;
    	console.log('active users:' + activeUsers);
    	sockets.remove(sockets.extractSessionId(socket))
  	});
  	socket.emit("identify",sockets.extractSessionId(socket));
  	sockets.save(socket);
});


// ============= 	LOAD CONFIG AND LAUNCH	 ============= //
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