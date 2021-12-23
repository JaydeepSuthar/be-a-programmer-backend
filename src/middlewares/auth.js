const jwt = require('jsonwebtoken');

module.exports.isLoggedIn = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ "msg": "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
    } catch (err) {
        return res.status(400).json({ "error": "Invalid Token" });
    }

    next();
};

module.exports.isAdmin = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ "msg": "Access Denied" });

    const decodedValue = jwt.decode(token, process.env.TOKEN_SECRET);
    const role = decodedValue.role;

    if (role != 0) return res.status(401).json({ "msg": "Admin Only Routes" });

    next();
};