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

// ! It will goes in it's seperate file
const CourseSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    short_description: {
        type: String,
        required: true
    },

    long_description: {
        type: String,
        // required: true
    },

    thubmnail: {
        type: String,
        required: true
    },

    is_free: {
        type: Boolean,
        required: true,
        default: false
    },

    is_public: {
        type: Boolean,
        required: true,
        default: false
    },

    insctructor: {
        type: String,
        required: true
    },

    vidoes: [
        {
            title: {
                type: String,
                required: true
            },

            length: Number,

            src_link: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true }, { collection: "courses" });

module.exports = model('user', UserSchema);
module.exports = model('course', CourseSchema);