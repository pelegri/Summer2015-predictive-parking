'use strict';

function initialize($scope) {

    var auto_address = new google.maps.places.Autocomplete(
    (document.getElementById('autocomplete_address')), {
        types: ['geocode']
    });

    var auto_destination = new google.maps.places.Autocomplete(
    (document.getElementById('autocomplete_destination')), {
        types: ['geocode']
    });

    $scope.startmarker = [];
    $scope.destmarker = [];


    google.maps.event.addListener(auto_address, 'place_changed', function(){
    	var place_address = auto_address.getPlace();
    	console.log(place_address.geometry.location);
    	$scope.formData.c_loc = place_address.geometry.location;
     	$scope.startmarker = 
    	{
    		id: 1,
    		coords: {
    			latitude: $scope.formData.c_loc.k,
    			longitude: $scope.formData.c_loc.D
    		},
    	}
    	console.log($scope.startmarker)
    	$scope.markers = [];
    });

    google.maps.event.addListener(auto_destination, 'place_changed', function(){
    	var place_destination = auto_destination.getPlace();
    	/*console.log(place_destination.geometry.location);*/
    	$scope.formData.d_loc = place_destination.geometry.location;
  /*  	$scope.destmarker = 
    	{
    		id: 1,
    		coords: {
    			latitude: $scope.formData.d_loc.k,
    			longitude: $scope.formData.d_loc.D
    		},
    	}
    	console.log($scope.destmarker)*/
    	$scope.markers = [];
    });
}


var app = angular.module('myApp', ['uiGmapgoogle-maps','ui.bootstrap'])
	.config(function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
          key: 'AIzaSyBWuwDi-Gzut4Zv6xRxSGl8gq2ygJWGGxs',
          v: '3.17',
          libraries: 'places' // Required for SearchBox.
      });
    });

app.controller('mainCtrl', ['$scope', function($scope) {
		$scope.locations = [
			{lat: -32.929971, lon: 151.772984},
			{lat: -32.931280, lon: 151.770883}, 
			{lat: 37.2206992743, lon: -121.9846208062},
			{lat: 37.2211670292, lon: -121.9837544527},
			{lat: 37.2221516545, lon: -121.9833387103},
			{lat: 37.2222114577, lon: -121.9840012160},
			{lat: 37.444506, lon: -122.160745},
			{lat: 37.444751, lon: -122.16109}];

		var createMarker = function(i) {

			var array = $scope.locations;
			//create a model of a marker for Google Maps API
			var ret = {
		    
		    id: i,
		    latitude: array[i].lat,
		    longitude: array[i].lon,
			}

		    return ret
		};

	    $scope.formData = {
	    	c_loc: 'default',
	    	d_loc: 'default',
	    	date: 'default',
	    	mytime: 'default',
	    };

	    $scope.map = { center: { latitude: 37.44496, longitude: -122.161648 }, zoom: 9 };

	    initialize($scope);

	    $scope.markers = [];

	    $scope.startmarker = [];

	    $scope.destmarker = [];

		var length = Object.keys($scope.locations).length;

		for (var i = 0; i < length; i++) {
			$scope.markers.push(createMarker(i))};
		console.log($scope.markers);

	}]);

app.controller('TimepickerDemoCtrl', function ($scope, $log)
	{
		$scope.mytime = new Date();
		$scope.formData.mytime = $scope.mytime;
		$scope.hstep = 1;
        $scope.mstep = 15;

		$scope.options = {
		    hstep: [1, 2, 3],
		    mstep: [1, 5, 10, 15, 25, 30]
		};

		$scope.ismeridian = true;
		$scope.toggleMode = function() {
		  $scope.ismeridian = ! $scope.ismeridian;
		};

		$scope.update = function() {
		  var d = new Date();
		  d.setHours( 14 );
		  d.setMinutes( 0 );
		  $scope.formData.mytime = d;
		};

		$scope.changed = function () {
		  $log.log('Time changed to: ' + $scope.mytime);
		  $scope.formData.mytime = $scope.mytime;
		};

		$scope.clear = function() {
		  $scope.formData.mytime = null;
		};
	});

app.controller('DatepickerDemoCtrl', function ($scope, $log){
		  $scope.today = function() {
	      $scope.dt = new Date();
	    };

	    $scope.today();

	    $scope.changed = function(){
	    	$scope.formData.date = $scope.dt;
	    };
	    
	    $scope.clear = function () {
	      $scope.dt = null;
	    };

	    // Disable weekend selection
	    $scope.disabled = function(date, mode) {
	      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	    };

	    $scope.toggleMin = function() {
	      $scope.minDate = $scope.minDate ? null : new Date();
	    };
	    
	    $scope.toggleMin();

	    $scope.open = function($event) {
	      $event.preventDefault();
	      $event.stopPropagation();

	      $scope.opened = true;

	    };

	    $scope.dateOptions = {
	      formatYear: 'yy',
	      startingDay: 1
	    };

	    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	    $scope.format = $scope.formats[0];

	    var tomorrow = new Date();
	    tomorrow.setDate(tomorrow.getDate() + 1);
	    var afterTomorrow = new Date();
	    afterTomorrow.setDate(tomorrow.getDate() + 2);
	    $scope.events =
	      [
	        {
	          date: tomorrow,
	          status: 'full'
	        },
	        {
	          date: afterTomorrow,
	          status: 'partially'
	        }
	      ];

	    $scope.getDayClass = function(date, mode, $log) {
	      if (mode === 'day') {
	        var dayToCheck = new Date(date).setHours(0,0,0,0);

	        for (var i=0;i<$scope.events.length;i++){
	          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

	          if (dayToCheck === currentDay) {
	            return $scope.events[i].status;
	          }
	        }
	      }

	      return '';
	    };
	});

app.controller('SubmitCtrl', function($scope,$rootScope,$http){
	$scope.formsubmit = function(){
		console.log($scope.formData);
		$http.get('/api/getestimate/', {params:{
			'c_loc': $scope.formData.c_loc,
			'd_loc': $scope.formData.d_loc,
			'date' : $scope.formData.date,
			'time' : $scope.formData.mytime
		}})
	    .success(function(data){
	    	$http.get('/test/', {params:{
	    		'hour': data.hour,
	    		'coords': data.coords}})
	    	.success(function(data){
	    		$rootScope.destmarker = [];
	    		var coords = data.coordinates.split(",")
			    $rootScope.destmarker = 
	  	    	{
		    		id: 1,
		    		coords: {
		    			latitude: coords[0],
		    			longitude: coords[1]
		    		},
		    	}
		    	console.log($rootScope.destmarker)
	    		if (data.vacancy > 0.8) {
	    			$scope.result = 'You should probably head out soon.';
	    		} else if (data.vacancy > 0.6 && data.vacancy < 0.8) {
	    			$scope.result = 'I think you can do it.'}
	    		else {
	    			$scope.result = "Take your time!";
	    		}
	    	})
		});
	}
});