require('dotenv').config({ path: __dirname + `/../.env` });

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');
const { connect } = require('mongoose');
// const path = require('path');

// * INIT
const app = express();
const port = process.env.PORT || 8080;

// * MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(helmet());
app.use(cors());

// * STATIC FILES
app.use('/static', express.static('public'));

// * ROUTES MIDDLEWARES
app.use('/api/user', require('./routes/user'));
app.use('/api/course', require('./routes/course'));

// * ROUTES
app.get('/', (req, res) => {
	//    res.render('pages/home.html');
	res.json({ msg: "Hello from backend" });
});

// *! 404 ERROR PAGE THIS MUST BE A THE END AFTER ALL ROUTES
app.use('*', (req, res) => {
	res.status(404).json({
		"Error": "Page Not Found"
	});
});

// * SERVER
app.listen(port, () => console.log(`listening at ${port}`));
