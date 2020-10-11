// import necessary modules
const mongoose = require('mongoose');

// define the schema
const meetingSchema = mongoose.Schema({
    meeting_id: {type: String, required: true},
    title: {type: String, required: true},
    datetime: {type: String, required: true},
    organiser: {type: String, required: true},
    attendies: {type: String},
    timestamp: {type: Date, default: Date.now()}
});

// export the model
module.exports = mongoose.model('Meeting', meetingSchema);