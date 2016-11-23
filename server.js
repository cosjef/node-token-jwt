// =======================
// Get the packages we need
// =======================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan= require('morgan');
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
// HMAC secret variable
app.set('superSecret', config.secret);


// use bodyParser to get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
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
// get an instance of the Express router for api routes
var apiRoutes = express.Router();

// route to authenticate a user via POST to /api/authenticate
apiRoutes.post('/authenticate', function(req, res) {
    // find the user in the POST body
    // use Mongoose to find the user
    User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

            // check to see if password matches
             if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
             } else {


                // if user is found and password is right
                // create a HMAC JWT token using jsonwebtoken
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: '24h' // expires in 24 hours
                });


                // return the information, including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });

});


// middleware to verify JWT token
apiRoutes.use(function(req, res, next) {
    // check header, url params, or POST parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {

        // verifies secret and checks expiration date (exp)
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token'});
            } else {

                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
                // if there is no token present, return an error
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'

                });

            }
        });



apiRoutes.get('/',function(req,res){
    res.json({message: 'Welcome to the coolest API on earth!'});
});

// route to return all users
apiRoutes.get('/users',function(req,res){
    User.find({},function(err,users){
        res.json(users);
    });
});

// apply the routes to our application having the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
