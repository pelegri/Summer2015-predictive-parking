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

    google.maps.event.addListener(auto_address, 'place_changed', function(){
    	var place_address = auto_address.getPlace();
    	console.log(place_address.geometry.location);
    	$scope.formData.c_loc = place_address.geometry.location;
    });

    google.maps.event.addListener(auto_destination, 'place_changed', function(){
    	var place_destination = auto_destination.getPlace();
    	console.log(place_destination.geometry.location);
    	$scope.formData.d_loc = place_destination.geometry.location;
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
	    $scope.formData = {
	    	c_loc: 'default',
	    	d_loc: 'default',
	    	date: 'default',
	    	mytime: 'default'
	    };

	    $scope.map = { center: { latitude: 37.44496, longitude: -122.161648 }, zoom: 19 };

	    initialize($scope);

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

app.controller('SubmitCtrl', function($scope,$http){
	$scope.formsubmit = function(){
		console.log($scope.formData);
		$http.get('/api/getestimate/', {params:{
			'c_loc': $scope.formData.c_loc,
			'd_loc': $scope.formData.d_loc,
			'date' : $scope.formData.date,
			'time' : $scope.formData.mytime
		}})
	    .success(function(data){
		  $scope.result = 'You have a ' + data + '% Chance';
		});
	};
});

app.controller('testCtrl', function($scope, $http){
	$scope.formsubmit = function(){
		$http.get('/test/')
		.success(function(data){
			$scope.test = data;
		});
	};
});