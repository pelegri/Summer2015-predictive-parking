var app = angular.module('thing',['uiGmapgoogle-maps']);
app.controller('MapController', ['$scope', function($scope) {
		$scope.map = { center: { latitude: 37.44496, longitude: -122.161648 }, zoom: 19 }
	}]);
