// =======================
// Get the packages we need
// =======================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./models/user');

// =======================
// Configuration
// =======================
var port = process.env.PORT || 8080;
// connect to database
mongoose.connect(config.database);
// secret variable
app.set('superSecret', config.secret);


// use bodyParser to get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


// use morgan to log requests to the console
app.use(morgan('dev'));


// =======================
// Setup routes
// =======================
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});


app.get('/setup', function(req, res) {

    // create a sample user
    var nick = new User({
        name: 'Nick Cerminara',
        password: 'password',
        admin: true
    });

    // save the sample user
    nick.save(function(err) {
        if (err) throw err;

        // if no error, log to console
        console.log('User saved succesfully');
        res.json({success: true });
    })
    });


// API ROUTES


// =======================
// start the server
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);