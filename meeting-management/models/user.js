// import required modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// define the user-schema
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    refreshToken: {type: String}
});

// method to encrypt password
userSchema.methods.encryptPassword = function(plainPassword) {
    return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(5));
}
// method to compare password
userSchema.methods.isValidPassword = function(plainPassword){
    return bcrypt.compareSync(plainPassword, this.password);
}

// export the user-schema
module.exports = mongoose.model('User', userSchema);