'use strict';

// Declare app level module which depends on views, and components
var lolScaleApp = angular.module('lolScaleApp', []);

lolScaleApp.controller('ChampionListCtrl', ['$scope', '$http', function ($scope, $http) {
   $http.get("http://ddragon.leagueoflegends.com/cdn/3.14.41/data/en_US/champion.json").success(function(data){
     console.log("asdfasdfs")
      $scope.data = data
   })

}])
