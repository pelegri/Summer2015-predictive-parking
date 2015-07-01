'use strict';
var app = angular.module('map',['uiGmapgoogle-maps'])
	.controller('MapController', ['$scope', '$http', function($scope, $http) {
		$scope.map = { center: { latitude: 37.44496, longitude: -122.161648 }, zoom: 19 };
	}]);
