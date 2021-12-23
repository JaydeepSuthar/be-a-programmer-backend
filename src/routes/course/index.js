const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * MODEL
const Course = require('../../models/course');

// * get all course
router.get('/', (req, res) => {
    res.status(200).json({ "msg": "all courses" });
});

// * create course
router.post('/add', isLoggedIn, isAdmin, (req, res) => {

    const { title, slug, description, thumbnail, instructor, videos } = req.body;

    res.status(200).json(req.body);
});

// * edit course
router.put('/update/:id', isLoggedIn, isAdmin, (req, res) => {
    res.status(200).json({ "msg": "course edited" });
});

// * delete course
router.delete('/remove/:id', isLoggedIn, isAdmin, (req, res) => {
    const { id } = req.params;
    res.status(200).json({ "msg": `${id} is deleted` });
});

module.exports = router;