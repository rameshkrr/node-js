var http = require('http');
var express = require('express');
var port = process.env.PORT || 8099;
var app = express();
var appRoutes = require('./routes/appRoutes');
var bodyParser = require('body-parser');
var cors = require('cors');
app.use(express.static('public'));




app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', appRoutes);


http.createServer(app).listen(port);

console.log("Backend Node", port);
