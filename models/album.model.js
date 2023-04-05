const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
    artist:{
        type: mongoose.Schema.ObjectId,
        ref: 'Artist'
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    year: {
        type: Number,
        required: true
    },
    image:{
        type: String,
        default: "default.png"
    },
    create_at:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Album', albumSchema, 'albums');