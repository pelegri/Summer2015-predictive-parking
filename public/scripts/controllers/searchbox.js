 'use strict'
 var app = angular.module('searchbox',[])
 	.controller('SearchBoxController', ['$scope', function($scope){
 		$scope.searchbox = { template: 'searchbox.tpl.html', events: events };
 	}]);