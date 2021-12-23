const router = require('express').Router();
const bcrypt = require('bcrypt');

// * VALIDATION
const { registerUserValidation, loginUserValidation, generateToken } = require('../../helper/validation');
const { isLoggedIn } = require('../../middlewares/auth');

// * MODEL
const User = require('../../models/user');

// * SIGNUP ROUTE
router.post('/signup', async (req, res) => {

    const { name, email, contact, password, role, is_authenticatd, is_pro_subscriber, verify_token } = req.body;

    // * check data is valid
    const { error, value } = registerUserValidation({ name, email, contact, password });
    if (error) return res.status(400).json({ 'error': error.details[0].message });

    // check user email already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ "msg": "Email is already register" });


    const hashedPassword = await bcrypt.hash(password, 10);

    // * saving it in db
    const user = new User({
        name: name,
        email: email.toLowerCase(),
        contact: contact,
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
    const user = await User.findOne({ email: email }).lean();
    if (!user) return res.status(400).json({ "msg": "No Account Found On This Email Please Create Account First" });

    // check password hash is valid
    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) return res.status(400).json({ "msg": "Email and Password Doesn't match" });

    // const token = jwt.sign
    const token = generateToken(user._id, user.role);

    res.header("authorization", token);
    // res.set
    res.json({
        "msg": "you are logged in",
        "role": user.role
        // token
    });

    res.end();
});


// * this is just a test route
router.get('/secret', isLoggedIn, (req, res) => {
    res.status(200).json({ "msg": "I am Secret" });
});

router.delete('/del/:id', (req, res) => {
    res.send('user deleted');
});

module.exports = router;