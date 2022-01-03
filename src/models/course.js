const { Schema, model } = require('mongoose');

const CourseSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    thumbnail: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    duration: {
        type: Number
    },

    requirement: {
        type: String
    },

    is_active: {
        type: Boolean,
        required: true,
        default: false
    },

    is_public: {
        type: Boolean,
        required: true,
        default: false
    },

    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    videos: [
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
}, { timestamps: true }, { collection: "Courses" });

module.exports = model('course', CourseSchema);