require('dotenv').config({ path: __dirname + `/../.env` });

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');
const { connect } = require('mongoose');

// * INIT
const app = express();
const port = process.env.PORT || 8080;

// * DB
// connect(process.env.MONGO_URI, console.log(`DB CONNECTED`));

// * MIDDLEWARES
app.use(express.json());
app.use(logger('dev'));
app.use(helmet());
app.use(cors());

// * ROUTES MIDDLEWARES
app.use('/api/user', require('./routes/user'));
app.use('/api/course', require('./routes/course'));

// * ROUTES
app.get('/', (req, res) => {
    res.send({ msg: 'hello programmeres' });
});

// *! 404 ERROR PAGE THIS MUST BE A THE END AFTER ALL ROUTES
app.use('*', (req, res) => {
    res.status(404).json({
        "Error": "Page Not Found"
    });
});

// * SERVER
app.listen(port, () => console.log(`listening at ${port}`));