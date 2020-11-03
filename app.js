var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var dotenv = require('dotenv');
var cors = require('cors');
var pets = require('./mock')

var indexRouter = require('./routes/index');

dotenv.config({path : './config.env'})

var app = express();

//connecting to mongodb
const DB = process.env.DB_URI.replace('<password>', process.env.DB_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true, useUnifiedTopology : true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", (callback) => {
    console.log("connected successfully")
    const petCollection = db.collection('pets')
    petCollection.estimatedDocumentCount((err, count) => {
        if (count) return
        petCollection.insertMany(pets)
        console.log('Done')
    })
})

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);

module.exports = app;
