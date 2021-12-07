const router = require('express').Router();

// * VALIDATION
const { registerUserValidation, loginUserValidation } = require('../../helper/validation');

// * MODEL
const User = require('../../models/user');

// * SIGNUP ROUTE
router.post('/signup', async (req, res) => {

    const { username, email, password } = req.body;

    // * check data is valid
    const { error, value } = registerUserValidation({ username, email, password });
    if (error) return res.status(400).json({ 'error': error.details[0].message });

    // res.send(value);

    // * saving it in db
    const user = new User({
        name: username,
        email: email,
        password: password
    });

    try {
        const newUser = await user.save();
        res.json(newUser);
    } catch (err) {
        res.status(400).json(err);
    }

    res.end();
});

// * LOGIN ROUTE
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const { error, value } = loginUserValidation({ email, password });
    if (error) return res.status(400).json({ 'error': error.details[0].message });

    res.send(value);

    res.end();
});

module.exports = router;