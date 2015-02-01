var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ScoreScema   = new Schema({
	watchId: String, 
	ip: String,
	mode: String,
	holdoff: Number,
	activity: String,
	circleArray:[{center:{x:Number,y:Number},radius:Number}],
	boxArray:[{tl:{x:Number,y:Number},br:{x:Number,y:Number}}],
	updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeveloperAccount', ScoreScema);