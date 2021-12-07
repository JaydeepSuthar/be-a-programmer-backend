const router = require('express').Router();

const { registerUserValidation } = require('../../helper/validation');

// * SIGNUP ROUTE
router.post('/signup', (req, res) => {

    const { username, email, password } = req.body;

    const { error, value } = registerUserValidation({ username, email, password });
    if (error) return res.status(400).json({ 'error': error.details[0].message });

    // res.send(value);

    res.end();
});

// * LOGIN ROUTE
router.post('/login', (req, res) => {
    console.log(req.body);
    res.end();
});

module.exports = router;