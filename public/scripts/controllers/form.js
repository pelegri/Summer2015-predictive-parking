'use strict'
var app = angular.module('myApp', ['uiGmapgoogle-maps']);
app.controller('mainCtrl', ['$scope', function($scope) {
    $scope.map = { center: { latitude: 37.44496, longitude: -122.161648 }, zoom: 19 };
}]);
