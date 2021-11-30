require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');

// * INIT
const app = express();
const port = process.env.PORT || 8080;

// * MIDDLEWARES
app.use(express.json());
app.use(logger('dev'));
app.use(helmet());

// * IMPORTED ROUTES MIDDLEWARES


// * IMPORTED ROUTES


// * ROUTES
app.get('/', (req, res) => {
    res.send({ msg: 'hello programmeres' });
});

// * SERVER
app.listen(port, () => console.log(`listening at ${port}`));