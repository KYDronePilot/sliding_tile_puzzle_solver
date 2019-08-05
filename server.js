// Import NPM packages
var path = require('path');
var express = require('express');

// Create an express app
var app = express();

// Set the static path to the dist folder where our compiled project will be
var staticPath = path.join(__dirname, '/dist');

// Use the static path to load static files
app.use(express.static(staticPath));

// Start listening on port 3000 for requests
app.listen(3000, function() {
    console.log('listening');
});