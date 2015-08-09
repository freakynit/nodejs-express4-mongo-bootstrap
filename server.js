var PORT = 3339;
var MONGO_HOST = "localhost";
var MONGO_PORT = 27017;
var MONGO_DB = "geodata";

var nconf = require('nconf');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mime = require('mime');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;



nconf.argv()
       .env()
       .file({file: 'config.json'});

nconf.defaults({
    'server': {
        'port': PORT
    },
    'mongo': {
        'host': MONGO_HOST,
        'port': MONGO_PORT,
        'db': MONGO_DB
    }
});



var app = express();

var mongoConnectionUrl = 'mongodb://' + nconf.get('mongo:host') + ':' + nconf.get('mongo:port') + '/' + nconf.get('mongo:db');
MongoClient.connect(mongoConnectionUrl, function(err, mongoDbConnection) {
  if(err) {
    console.log("Error in connecting to mongodb: ", err);
  } else {
    console.log("Connected correctly to server");
    
    app.all('*', function(req, res, next) {
        req.mongoConn = mongoDbConnection;
        next();
    });

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({
        secret : "SHUUUUSH",
        saveUninitialized: true,
        resave : false 
    }));

    var index = require('./routes/index');
    app.use(index);

    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                "message": err.message,
                "error": err
            });
        });
    }

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            "message": err.message,
            "error": {}
        });
    });

    app.listen(nconf.get('server:port'), function(){
      console.log("Started on PORT " + nconf.get('server:port'));
    });

  }
});

