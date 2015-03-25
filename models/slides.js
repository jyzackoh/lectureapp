var mongoose = require('mongoose');
var User = require('../models/users');


// define the schema for our user model
var slidesSchema = mongoose.Schema({
	id: String,
	user: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('Slides', slidesSchema);