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

    instructor: {
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

module.exports = model('course', CourseSchema);