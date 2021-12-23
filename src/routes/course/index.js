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
router.post('/create', isLoggedIn, isAdmin, (req, res) => {
    res.status(200).json({ "msg": "course created" });
});

// * edit course
router.put('/edit/:id', isLoggedIn, isAdmin, (req, res) => {
    res.status(200).json({ "msg": "course edited" });
});

// * delete course
router.delete('/remove'), isLoggedIn, isAdmin, (req, res) => {
    res.status(200).json({ "msg": "course deleted" });
};

module.exports = router;