/**
Author - Jasper Chen 
Date - August 24, 2015
Description - This Node back-end code connects to a MongoDB database, 
	      listens for AngularJS front-end queries and retrieves
	      information for the client.
**/

'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var options = {
	user: '<REPLACE>', // fill username here
	pass: '<REPLACE>' // file password here
}
mongoose.connect('<REPLACE>', options); //replace with mongo URI here

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
  /* finds matching hour and coordinates in database*/
  var hour = req.param('hour');
  var coordinates = req.param('coords')
  Parking.findOne({coordinates: coordinates, hour: hour}, function(err, result) {
  if (err) 
  	return console.error(err);
  res.send(result);
  });
});

app.get('/api/getestimate/', function(req, res){
	/* finds and returns nearest tracked parking zone to user's destination */
	var c_loc = req.param('c_loc');
	var d_loc = JSON.parse(req.param('d_loc'));
	var date = req.param('date');
	var time = req.param('time');
	var d = parseFloat(d_loc.D);
	var k = parseFloat(d_loc.k);

	//hard coded array of zone coordinates 
	var arr = [{lat: -32.929971, lon: 151.772984},
			   {lat: -32.931280, lon: 151.770883},
			   {lat: 37.2206992743, lon: -121.9846208062},
			   {lat: 37.2211670292, lon: -121.9837544527},
			   {lat: 37.2221516545, lon: -121.9833387103},
			   {lat: 37.2222114577, lon: -121.9840012160},
			   {lat: 37.444506, lon: -122.160745},
			   {lat: 37.444751, lon: -122.16109}];

	var change = 10000; 
	var new_lat = null;
	var new_lon = null;

	//find nearest zone to destination
	for (var i = 0; i < arr.length; i++){
		var coord_lat = arr[i].lat;
		var coord_lon = arr[i].lon;
		var new_change = Math.sqrt(Math.pow(k - coord_lat, 2) + Math.pow(d - coord_lon, 2));

		if (new_change < change) {
			change = new_change;
			new_lat = coord_lat;
			new_lon = coord_lon;

		} else {
			change = change;
		}
	}

	var new_coords = new_lat.toString() + ', ' + new_lon.toString();
	process.stdout.write(new_coords);

	var dayv = new Date(date).getDay().toString();
	var hourv = new Date(time).getHours().toString();
	var dayhour = JSON.stringify({hour: hourv, coords: new_coords});
	res.send(dayhour);
});

app.listen(process.env.PORT || 3001);
