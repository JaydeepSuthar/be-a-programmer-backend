const router = require('express').Router();
const bcrypt = require('bcrypt');

// * VALIDATION
const { registerUserValidation, loginUserValidation, generateToken } = require('../../helper/validation');
const verifyToken = require('../../middlewares/verifyToken');

// * MODEL
const User = require('../../models/user');

// * SIGNUP ROUTE
router.post('/signup', async (req, res) => {

    const { name, email, password } = req.body;

    // * check data is valid
    const { error, value } = registerUserValidation({ name, email, password });
    if (error) return res.status(400).json({ 'error': error.details[0].message });

    // check user email already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ "msg": "Email is already register" });


    const hashedPassword = await bcrypt.hash(password, 10);

    // * saving it in db
    const user = new User({
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword
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

    // check password hash is valid
    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) return res.status(400).json({ "msg": "Email and Password Doesn't match" });

    // const token = jwt.sign
    const token = generateToken(user._id);

    res.json({
        "msg": "you are logged in",
        token
    });

    res.end();
});


// * this is just a test route
router.get('/secret', verifyToken, (req, res) => {
    res.status(200).json({ "msg": "I am Secret" });
});

module.exports = router;