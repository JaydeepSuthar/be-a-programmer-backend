const jwt = require('jsonwebtoken');

// ! for building frontend i am disabling this auth later change it

module.exports.isLoggedIn = (req, res, next) => {

	if (process.env.NODE_ENV != 'development') {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) return res.status(401).json({ "msg": "Access Denied" });

		try {
			const verified = jwt.verify(token, process.env.TOKEN_SECRET);
			req.user = verified;
		} catch (err) {
			return res.status(400).json({ "error": "Invalid Token" });
		}
	}

	next();
};

module.exports.isAdmin = (req, res, next) => {

	if (process.env.NODE_ENV !== 'development') {
		// const authHeader = req.headers['authorization'];
		// const token = authHeader && authHeader.split(' ')[1];

		// if (!token) return res.status(401).json({ "msg": "Access Denied" });

		// const decodedValue = jwt.decode(token, process.env.TOKEN_SECRET);
		// const role = decodedValue.role;

		// if (role != 0) return res.status(401).json({ "msg": "Admin Only Routes" });

		console.log(req.session.user);

		if (req.session.user && req.session.user.role === 'admin') {
			return next();
		} else if (req.session.user && req.session.user.role === 'instructor') {
			return res.status(401).json({ is_success: false, "msg": "Instructors are not allowed" });
		}
		return res.status(401).json({ is_success: false, "msg": "Admin Only Routes" });

	}

	next();
};

module.exports.verifyAdmin = (req, res, next) => {

	if (process.env.NODE_ENV !== 'development') {
		console.log(req.session.user);

		if (req.session.user && req.session.user.role === 'admin') {
			return next();
		} else if (req.session.user && req.session.user.role === 'instructor') {
			return res.status(401).json({ is_success: false, "msg": "Instructors are not allowed" });
		}
		return res.status(401).json({ is_success: false, "msg": "Admin Only Routes" });
	}

	next();

};

module.exports.verifyUserLogin = (req, res, next) => {

	if (process.env.NODE_ENV !== 'development') {
		console.log(req.session.user);

		if (!req.session.user) {
			return res.status(200).json({ is_success: false, msg: `Please Logged Logged In` });
		}
	}

	next();

};
