var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Annotation model
var annotationSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    }
});

// methods ======================
// generating a hash
annotationSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
annotationSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for annotations and expose it to our app
module.exports = mongoose.model('Annotation', annotationSchema);
