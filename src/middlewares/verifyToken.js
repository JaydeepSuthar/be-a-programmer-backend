const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.body.token;
    if (!token) return res.status(401).json({ "msg": "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
    } catch (err) {
        return res.status(400).json({ "error": "Invalid Token" });
    }

    next();
};

module.exports = verifyToken;