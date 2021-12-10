const router = require('express').Router();

// * VALIDATION
const { registerUserValidation, loginUserValidation } = require('../../helper/validation');

// * MODEL
const User = require('../../models/user');

// * SIGNUP ROUTE
router.post('/signup', async (req, res) => {

    const { name, email, password } = req.body;

    // * check data is valid
    const { error, value } = registerUserValidation({ name, email, password });
    if (error) return res.status(400).json({ 'error': error.details[0].message });


    // * saving it in db
    const user = new User({
        name: name,
        email: email,
        password: password
    });

    try {
        const newUser = await user.save();
        res.json({
            msg: "User Created",
            "id": newUser._id
        });
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

    // Check email and password is valid

    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ "msg": "No Account Found On This Email Please Create Account First" });


    // compare password
    if (user.password === password) {
        console.log('password match');
    } else {
        console.log('doesn\'t match');
    }

    res.send(value);

    res.end();
});

module.exports = router;