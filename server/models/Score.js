var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ScoreScema   = new Schema({
	_id: String, 
	score: Number,
	updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HighScore', ScoreScema);