var mongoose = require('mongoose');
var User = require('../models/users');

// define the schema for our Annotation model
var annotationSchema = mongoose.Schema({
	visibility: Number,
	page: Number,
	x: Number,
	y: Number,
	slides: String,
	user: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
});

// methods ======================

// create the model for annotations and expose it to our app
module.exports = mongoose.model('Annotation', annotationSchema);
