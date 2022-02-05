require('dotenv').config({ path: __dirname + `/../.env` });

const express = require('express');
const logger = require('morgan');
const cors = require('cors');

// * INIT
const app = express();
const port = process.env.PORT || 8080;

// * MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cors({
	origin: ['http://localhost:3000'],
	credentials: true
}));

// * STATIC FILES
app.use('/static', express.static('public'));

// * ROUTES MIDDLEWARES
app.use('/api/user', require('./routes/user'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/course', require('./routes/course'));
app.use('/api/video', require('./routes/course/video'));
app.use('/api/chapter', require('./routes/course/chapter'));

// * ROUTES
app.get('/', (req, res) => {
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
