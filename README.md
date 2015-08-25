# Dash
Dash is a user-interfacing web app that tells the user given their address, destination and departure time the chances of them finding parking quickly. I have written a blog post on the process here <a href="https://jasperblogs.wordpress.com/2015/07/21/52/"> here </a>. 

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
* set up S3
* reconfigure settings on datacollect.py
* run datacollect.py, which collects and stores parking data from a parking data API and weather API onto S3
* port data on S3 onto a MongoDB database
* reconfigure settings on server.py to point to MongoDB database
* run the scripts to deploy project:
```modulus create ```
```modulus deploy ```

## Motivation
As part of my summer internship at Progress Software, I developed a Node web app using the Express web framework that pulls from a Parking Sensor API and displays onto a hosted website using Angular.


