'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydb');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

var Schema = mongoose.Schema;
var parkingSchema = new Schema({
  coordinates: String,
  hour: Number,
  vacancy: Number
},
  {collection: 'vimoc'});

var Parking = mongoose.model('vimoc', parkingSchema);

app.get('/', function(req, res){
	res.render('index.jade');
});

app.get('/test/', function(req, res){
  Parking.findOne({ coordinates: '-32.929971, 151.772984' }, function(err, thor) {
  if (err) return console.error(err);
     res.send(thor);
	});
});

app.get('/api/getestimate/', function(req, res){
	var c_loc = req.param('c_loc');
	var d_loc = req.param('d_loc');
	var date = req.param('date');
	var time = req.param('time');

	var day = new Date(date).getDay().toString();
	var hour = new Date(time).getHours().toString();

	var points = 0;

	if (day === 0 || day == 6) {
		var points = 60;
	} else {
		var points = 40;
	}

	if (hour > 8 && hour < 18) {
		points = points - 20;
	} else {
		points = points + 20;
	}

	res.send(points.toString());
});

app.listen(process.env.PORT || 3001);
