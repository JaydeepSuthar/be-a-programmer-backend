const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    contact: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    is_authenticated: {
        type: Boolean,
        required: true,
        default: false
    },

    qualification: {
        type: String,
        enum: ['higher_secondary', 'under_graduate', 'post_graduate']
    },

    address: {
        type: String
    }
}, { timestamps: true }, { collection: "Users" });

module.exports = model('user', UserSchema);