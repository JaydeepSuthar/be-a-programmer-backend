const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * MODEL
const Course = require('../../models/course');

// * get all course
router.get('/', async (req, res) => {

    res.end();

});

// * create course
router.post('/add', isLoggedIn, isAdmin, async (req, res) => {

    const { title, slug, description, thumbnail, instructor, is_public, is_free, videos } = req.body;

    console.log(videos);

    // * validate data

    // * check course already exists

    // * saving it in db
    const course = new Course({
        title,
        slug,
        description,
        thumbnail,
        instructor,
        is_free,
        is_public,
        videos: [...videos]
    });

    try {
        const newCourse = await course.save();
        res.json({
            msg: "Course Created",
            "Course ID": newCourse._id
        });
    } catch (err) {
        res.status(400).json(err);
    }

});

// * edit course
router.put('/update/:course_id', isLoggedIn, isAdmin, async (req, res) => {
    // res.status(200).json({ "msg": "course edited" });

    // * const { title, slug, description, thumbnail, instructor, is_public, is_free, videos } = req.body;
    const { course_id } = req.params;

    // * check course exists or not
    const course = await Course.findOne({ _id: course_id }).lean();
    if (!course) return res.status(400).json({ "msg": "Course Not Found" });

    // * update
    try {
        const updatedCourse = await Course.updateOne({ _id: course_id }, req.body);
        res.json({
            msg: "Course Updated",
            "Course ID": updatedCourse._id
        });
    } catch (err) {
        res.status(400).json(err);
    }

});

// * delete course
router.delete('/remove/:course_id', isLoggedIn, isAdmin, async (req, res) => {
    const { course_id } = req.params;

    if (!course_id) return res.status(400).json({ msg: "Please provide valid course id" });

    // * check course exists or not
    const course = await Course.findOne({ _id: course_id }).lean();
    if (!course) return res.status(400).json({ "msg": "Course Not Found" });

    try {
        const deletedCourse = await Course.deleteOne({ _id: course_id });
        res.status(200).json(deletedCourse);
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;