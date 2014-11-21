'use strict';

// Declare app level module which depends on views, and components
var lolScaleApp = angular.module('lolScaleApp', ['lolScaleApp.services']).directive('resize', function () {

    return {
      restrict: 'A',
      scope: {},
      link: function(scope, elem, attrs) {
        elem.css('height', '60px');
      }
    };
  });
angular.module('lolScaleApp.services',[]).factory('selectedChampionService',function(){
    return{
        selectionMade: false,
        champSelection: '',
        champData: {}
    };
});


lolScaleApp.controller('ChampionDetailsCtrl' , ['$scope', '$http', 'selectedChampionService', function( $scope, $http, selectedChampionService) {
   $scope.selectedChampionService = selectedChampionService;
    $scope.selectedLevel = 1;
    var calculateStats = function(){
        console.log($scope.selectedLevel);
    };
    $scope.$watch('selectedChampionService',calculateStats,true);

}]);

lolScaleApp.controller('ChampionListCtrl', ['$scope', '$http', 'selectedChampionService', function ($scope, $http, selectedChampionService) {
   $http.get("http://ddragon.leagueoflegends.com/cdn/3.14.41/data/en_US/champion.json").success(function(data){
      $scope.data = data
   });
    $scope.selectedChampionService = selectedChampionService;
    $scope.selectChampion = function(champion) {
        $scope.selectedChampionService.champSelection = champion
        $scope.selectedChampionService.selectionMade = true;
        $http.get("http://ddragon.leagueoflegends.com/cdn/3.14.41/data/en_US/champion/" + champion + ".json").success(function(data){
            $scope.selectedChampionService.champData = data.data[champion];
        })
    }

}]);
