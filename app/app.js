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
        champData: {},
        spellSelectionMade: false
    };
}).factory('versionService',function($http){
    var versionData = {
        "item":"4.20.1",
        "rune":"4.17.1",
        "mastery":"4.17.1",
        "summoner":"4.20.1",
        "champion":"4.20.1",
        "profileicon":"4.20.1",
        "language":"4.20.1"
    };

    //XRSF seems to cause this to suck
//    $http.get("http://ddragon.leagueoflegends.com/realms/na.json").success(function(data){
//        versionData = data.n;
//        console.log(versionData)
//    });
    return{
        versionData: versionData
    };
});

lolScaleApp.controller('ChampionDetailsCtrl' , ['$scope', '$http', 'selectedChampionService', 'versionService',
    function( $scope, $http, selectedChampionService, versionService) {
        $scope.selectedChampionService = selectedChampionService;
        $scope.versionService = versionService;

        $scope.selectedLevel = 1;
        $scope.championStats = {
            hp:0,
            attackdamage:0,
            hpregen:0,
            mp:0,
            armor:0,
            mpregen:0,
            spellblock:0,
            attackrange:0,
            movespeed:0
        };
        var calculateStats = function(){
            if($scope.selectedChampionService.champData.stats != null){
                console.log($scope.selectedChampionService.champData.id)
                $scope.championStats.hp = $scope.selectedChampionService.champData.stats.hp + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.hpperlevel)
                $scope.championStats.mp = $scope.selectedChampionService.champData.stats.mp + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.mpperlevel)

                $scope.championStats.hpregen = $scope.selectedChampionService.champData.stats.hpregen + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.hpregenperlevel)
                $scope.championStats.mpregen = $scope.selectedChampionService.champData.stats.mpregen + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.mpregenperlevel)
                $scope.championStats.attackdamage = $scope.selectedChampionService.champData.stats.attackdamage + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.attackdamageperlevel)
                $scope.championStats.armor = $scope.selectedChampionService.champData.stats.armor + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.armorperlevel)
                $scope.championStats.spellblock = $scope.selectedChampionService.champData.stats.spellblock + (($scope.selectedLevel-1) * $scope.selectedChampionService.champData.stats.spellblockperlevel)


            }
        };
        $scope.$watch('selectedLevel',calculateStats,true);
        $scope.$watch('selectedChampionService.champSelection',calculateStats,true);

    }]);

lolScaleApp.controller('CharacterMovesController' , ['$scope', '$http', 'selectedChampionService', 'versionService',
    function( $scope, $http, selectedChampionService, versionService) {
        $scope.selectedChampionService = selectedChampionService;
        $scope.versionService = versionService;
        $scope.selectedSpellData = {};
        $scope.selectedLevel = 1;
        $scope.championStats = {
            hp:0,
            attackdamage:0,
            hpregen:0,
            mp:0,
            armor:0,
            mpregen:0,
            spellblock:0,
            attackrange:0,
            movespeed:0
        };
        $scope.selectSpell = function(spell){
            console.log(spell);
            $scope.selectedChampionService.spellSelectionMade = true;
            $scope.selectedSpellData = $scope.selectedChampionService.champData.spells[spell]
        }

    }]);

lolScaleApp.controller('ChampionListCtrl', ['$scope', '$http', 'selectedChampionService', 'versionService',
    function ($scope, $http, selectedChampionService, versionService) {
        $scope.versionService = versionService;

        $http.get("http://ddragon.leagueoflegends.com/cdn/" + $scope.versionService.versionData.champion + "/data/en_US/champion.json").success(function(data){
      $scope.data = data
   });
    $scope.selectedChampionService = selectedChampionService;
    $scope.selectChampion = function(champion) {

        $scope.selectedChampionService.selectionMade = true;
        $http.get("http://ddragon.leagueoflegends.com/cdn/" + $scope.versionService.versionData.champion + "/data/en_US/champion/" + champion + ".json").success(function(data){
            $scope.selectedChampionService.champData = data.data[champion];
            $scope.selectedChampionService.champSelection = champion
        });
    }

}]);
