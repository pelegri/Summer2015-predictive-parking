'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('index.jade');
});

app.listen(process.env.PORT || 3001);
