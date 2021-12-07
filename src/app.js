require('dotenv').config({ path: __dirname + `/../.env` });

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');

// * INIT
const app = express();
const port = process.env.PORT || 8080;

// * MIDDLEWARES
app.use(express.json());
app.use(logger('dev'));
app.use(helmet());
app.use(cors());

// * ROUTES MIDDLEWARES
// app.use('/api', require('./routes')); this is not gone a work
app.use('/auth', require('./routes/auth'));

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