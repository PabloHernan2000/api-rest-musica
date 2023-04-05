const mongoose = require('mongoose');

const artistSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Artist', artistSchema, 'artists');