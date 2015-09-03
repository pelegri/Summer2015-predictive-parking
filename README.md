# Dash
Dash is a user-interfacing web app that tells the user given their address, destination and departure time the chances of them finding parking quickly. I have written a blog post on the process <a href="https://jasperblogs.wordpress.com/2015/07/21/52/"> here</a>. 

![alt tag](https://github.com/jasper-chen/predictive-parking/blob/master/final.png)

## Tools used
* Apache Spark
* Pandas
* MEAN stack (MongoDB, Express.js, Angular.js, Node.js)
* Modulus (to host web application)

## Dependencies
* "express" : "4.12.x",
* "request" : "2.55.x",
* "path" : "0.11.x",
* "mongoose" : "4.0.x",
* "jade": "1.11.x"

## Getting Started
* fork this repo
* set up S3
* reconfigure settings on data_collect.py
* run data_collect.py, which collects and stores parking data from a parking data API and weather API onto S3
* port data on S3 onto a MongoDB database
* reconfigure auth settings on server.js and point to the MongoDB database
* run the scripts in repo directory to deploy project:
```modulus create ```
```modulus deploy ```

## Motivation
As part of my summer internship at Progress Software, I developed a Node web app using the Express web framework that pulls from a Parking Sensor API and displays onto a hosted website using Angular.


