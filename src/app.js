require('dotenv').config({ path: __dirname + `/../.env` });

const express = require('express');
const logger = require('morgan');
const cors = require('cors');

// * INIT
const app = express();
const port = process.env.PORT || 8080;

// * MIDDLEWARES
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cors({
	origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5050', 'http://localhost:3030'],
	credentials: true
}));

// * STATIC FILES
app.use('/static', express.static('public'));
app.use('/video', express.static('upload'));

// * ROUTES MIDDLEWARES
app.use('/api/user', require('./routes/user'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/course', require('./routes/course'));
app.use('/api/video', require('./routes/course/video'));
app.use('/api/chapter', require('./routes/course/chapter'));

app.use('/api/misc', require('./routes/misc'));

// * ROUTES
app.get('/api', (req, res) => {
	res.json({ msg: `Hello from backend ${process.env.NODE_ENV}` });
});

// *! 404 ERROR PAGE THIS MUST BE A THE END AFTER ALL ROUTES
app.use('*', (req, res) => {
	res.status(404).json({
		error: `Page not found`
	});
});

// * SERVER
app.listen(port, () => console.log(`listening at ${port}`));
