#Jasper Chen
#Date: June 22, 2015

import requests
import time
import json
import os
API_KEY = os.environ['HOME'].get('VIMOC_API_KEY')

class Parking():
	def __init__(self):
		self.occupancy_by_sensor = {}
		self.sensors_by_zone = {}
		self.vacancy_by_zone = {}
		self.zones = {}
		self.time_by_zone = {}
		self.latlon_by_zone = {}

		r = requests.get('http://api.landscape-computing.com/api/rest/v1/sensor/pa_1_P1/query/occupied?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		self.timestamp = r.json()[0]['readingTime'].encode('utf-8')

	def get_all_zones(self):
		r = requests.get('http://api.landscape-computing.com/api/rest/v1/sites/?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		r_json = r.json()

		#print r_json

		all_zones = []

		#unordered list and O(N^2) implementation
		for i in range(len(r_json)):
			j = 0
			zone_num = len(r_json[i][u'zone'])
			while j < zone_num:
				zone = r_json[i][u'zone'][j][u'guid'].encode('utf-8')
				all_zones.append(zone)
				lat,lon =  r_json[i][u'zone'][j][u'gpsCoord'][0].encode('utf-8').split(',')
				self.latlon_by_zone[zone] = {'latitude': lat, 'longitude': lon.strip()}
				j+=1
		return all_zones

	def get_all_sites(self):
		#unordered list and O(N) implementation
		r = requests.get('http://api.landscape-computing.com/api/rest/v1/sites/?key=' + API_KEY, headers={'content-type': 'application/json', 'Accept': 'application/json'})
		r_json = r.json()

		all_sites = []

		for i in range(len(r_json)):
				all_sites.append(r_json[i][u'id'].encode('utf-8'))
		return all_sites

	def create_dict_site_vacancy(self,site):
		#O(N) implementation
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
		#O(N) implementation
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
		#print zone,available_sensors
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
		self.time_by_zone[self.timestamp.encode('utf-8')] = self.vacancy_by_zone
		print self.time_by_zone

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

# class Weather(object):
# 	def __init__(self, value):
# 		self.parking = value

# 	def get_weather_by_zone(self, zone):
# 		print zone

# 	def zone_wrapper(self):
# 		for i in range(len(self.parking.zones)):
# 			self.get_weather_by_zone(self.parking.zones[i])

if __name__ == '__main__':
	p = Parking()
	p.main()

	for i in range(len(p.zones)):
		w = Weather(p.latlon_by_zone[p.zones[i]]['latitude'],p.latlon_by_zone[p.zones[i]]['longitude'])
		try: 
			d = json.loads({p.timestamp: {p.zones[i]: {'weather_field': w.main(), 'vacancy_field': p.vacancy_by_zone[p.zones[i]]}}})
		except KeyError:
			pass


