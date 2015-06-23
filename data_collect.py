#!/usr/bin/env python
"""
Author - Jasper Chen 
Date - June 22, 2015

Description - The script aggregates and reformats parking and weather
information from various data sources.

Functions - Pushes JSON files into an Amazon S3 bucket.

APIs Used - Vimoc Technologies: provides parking sensor data 
	in JSON format (http://sdk.landscape-computing.com/)
	 - OpenWeatherMap: provides real-time weather data 
	in JSON format (http://api.openweathermap.org/)

Use - Intended to be called using a CRON task, which periodically
calls this script.
"""

import requests
import time
import json
import os
import boto
from boto.s3.key import Key

API_KEY = os.environ.get('VIMOC_API_KEY') #in bash_profile
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

class Parking():
	def __init__(self):
		"""Create dictionaries relating to parking"""
		self.occupancy_by_sensor = {}
		self.sensors_by_zone = {}
		self.vacancy_by_zone = {}
		self.zones = {}
		self.time_by_zone = {}
		self.latlon_by_zone = {}
		self.site_by_zone = {}
		self.timezone_by_zone = {}

		r = requests.get('http://api.landscape-computing.com/api/rest/v1/sensor/pa_1_P1/query/occupied?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		self.timestamp = r.json()[0]['readingTime'].encode('utf-8')

	def time_wrapper(self,zone_list):
		for i in range(len(zone_list)):
			self.get_time_by_zone(zone_list[i])

	def get_all_zones(self):
		"""Retrieve all zones."""
		r = requests.get('http://api.landscape-computing.com/api/rest/v1/sites/?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		
		r_json = r.json()

		all_zones = []

		for i in range(len(r_json)):
			j = 0
			zone_num = len(r_json[i][u'zone'])
			while j < zone_num:
				zone = r_json[i][u'zone'][j][u'guid'].encode('utf-8')
				all_zones.append(zone)
				lat,lon =  r_json[i][u'zone'][j][u'gpsCoord'][0].encode('utf-8').split(',')
				self.timezone_by_zone[zone] = r_json[i][u'timeZone']
				self.latlon_by_zone[zone] = {'latitude': lat, 'longitude': lon.strip()}
				j+=1
		return all_zones

	def get_all_sites(self):
		"""Returns all sites."""

		r = requests.get('http://api.landscape-computing.com/api/rest/v1/sites/?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		r_json = r.json()

		all_sites = []

		for i in range(len(r_json)):
				all_sites.append(r_json[i][u'id'].encode('utf-8'))
		return all_sites

	def create_dict_site_vacancy(self,site):
		"""Returns a site vacancy."""

		r = requests.get('http://api.landscape-computing.com/nboxws/rest/v1/site/' + site + '/query/summary/?key=' + API_KEY)
		raw_sensor_list = r.text.split('|')

		for i in range(1, len(raw_sensor_list)-1):
			sensor_info = raw_sensor_list[i].split(':')
			sensor_id = sensor_info[0].encode('utf-8')
			sensor_attr = sensor_info[1]
			sensor_occ = sensor_attr.split('%')[0].strip().encode('utf-8')
			sensor_dur = sensor_attr.split('%')[1]
			self.occupancy_by_sensor[sensor_id] = sensor_occ

	def site_wrapper(self,site_list):
		"""Calls 'create_dict_site_vacancy' for each site

		Keyword arguments:
		site_list -- a list of sites

		""" 

		for i in range(len(site_list)):
			self.create_dict_site_vacancy(site_list[i])

	def get_sensors_in_zone(self,zone):
		sensors = []
		r = requests.get('http://api.landscape-computing.com/api/rest/v1/zone/' + zone + '/?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		r_json = r.json()
		b = r_json[u'sensorId']
		for i in range(len(b)):
			sensors.append(b[i][u'guid'].encode('utf-8'))

		self.sensors_by_zone[zone] = sensors

	def zone_wrapper(self,site_list):
		for i in range(len(site_list)):
	 		a = self.get_sensors_in_zone(site_list[i])

	def get_vacancy_by_zone(self,zone):
		sensors = self.sensors_by_zone[zone]
		count = 0 
		i = 0
		broken_sensors = 0
		num_sensors = len(sensors)
		while i < num_sensors:
			try:
				count += int(self.occupancy_by_sensor[sensors[i]])
				i+=1
			except (KeyError):
				broken_sensors+=1
				i+=1
		available_sensors = num_sensors - broken_sensors
		if available_sensors > 0:
			self.vacancy_by_zone[zone] = {'vacancy' : float(count)/float(available_sensors), 'count' : available_sensors}
		else:
			pass

	def vacancy_wrapper(self,zone_list):
		for i in range(len(zone_list)):
			self.get_vacancy_by_zone(zone_list[i])

	def main(self):
		sites = self.get_all_sites()
		sensors = self.site_wrapper(sites)
		self.zones = self.get_all_zones()
		self.zone_wrapper(self.zones)
		self.vacancy_wrapper(self.zones)
		#self.time_wrapper(self.zones)
		#print self.time_by_zone

class Weather():
	def __init__(self, lat, lon):
		self.lat = lat
		self.lon = lon
		r = requests.get('http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + ')', headers={'content-type': 'application/json', 'Accept': 'application/json'})
		r_json = r.json()
		self.sunrise = r_json['sys']['sunrise']
		self.sunset = r_json['sys']['sunset']
		self.weather = r_json[u'weather'][0][u'main'].encode('utf-8')
		self.wind = r_json[u'wind'][u'speed']
		self.temp_f = (float(r_json[u'main'][u'temp']) - 273.15)/1.8 + 32.00
		self.humidity = r_json[u'main']['humidity']
	
	def main(self):
		return {'lat': self.lat, 'lon': self.lon, 'sunrise': self.sunrise, 'sunset': self.sunset, 'weather': self.weather, 'wind': self.wind, 'temp_f': self.temp_f, 'humidity': self.humidity}

class S3():
	def __init__(self, content, time, zone):
		c = boto.connect_s3(AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY)
		b = c.get_bucket('parkingbucket')
		k = Key(b)
		sub_dir = 'files'
		filename = time + '_' + zone + '.json'
		subdir = os.path.dirname(filename)
		if not os.path.exists(sub_dir):
			os.makedirs(sub_dir)
		with open(os.path.join(sub_dir,filename),'w+') as f:
		#with open(filename,'w+') as f:
			print 'test'
			#f.write(content)
		k.key = filename
		k.set_contents_from_filename(os.path.join(sub_dir,filename))

if __name__ == '__main__':
	p = Parking()
	p.main()

	def run():
		for i in range(len(p.zones)):
			w = Weather(p.latlon_by_zone[p.zones[i]]['latitude'],p.latlon_by_zone[p.zones[i]]['longitude'])
			try: 
				d = json.dumps({'time': p.timestamp, 'zone': p.zones[i], 'timezone': p.timezone_by_zone[p.zones[i]], 'weather_field': w.main(), 'vacancy_field': p.vacancy_by_zone[p.zones[i]]})
				S3(d, p.timestamp, p.zones[i])
				print 'done'
			except KeyError:
				print 'failed'
				pass
	run()
	

