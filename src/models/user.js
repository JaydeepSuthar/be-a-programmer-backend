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

    role: {
        type: Number,
        required: true,
        default: 2
    },

    is_authenticated: {
        type: Boolean,
        required: true,
        default: false
    },

    is_pro_subscriber: {
        type: Boolean,
        required: true,
        default: false
    },

    verify_token: String,

    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'courses'
    }]
}, { timestamps: true }, { collection: "users" });

module.exports = model('user', UserSchema);