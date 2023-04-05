const mongoose = require('mongoose');

const songSchema = mongoose.Schema({
    album:{
        type: mongoose.Schema.ObjectId,
        ref: 'Album'
    },
    track: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    file: {
        type: String,
        default: "default.mp3"
    },
    create_at:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Song', songSchema, 'songs');