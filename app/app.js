'use strict';

// Declare app level module which depends on views, and components
var lolScaleApp = angular.module('lolScaleApp', ['lolScaleApp.services','ngSanitize','ui.bootstrap.modal']).directive('resize', function () {

    return {
      restrict: 'A',
      scope: {},
      link: function(scope, elem, attrs) {
        elem.css('height', '60px');
      }
    };
  });


angular.module('lolScaleApp.services',[]).factory('selectedChampionService',function(){
    var createPlayer = function(){
        return {
            champData: {},
            selectionMade: false,
            champSelection: '',
            spellSelectionMade: false,
            selectedLevel: 1,
            championStats: {
                hp:0,
                attackdamage:0,
                spelldamage:0,
                hpregen:0,
                mp:0,
                armor:0,
                mpregen:0,
                spellblock:0,
                attackrange:0,
                movespeed:0
            },
            championItems:[1,2,3,4,5,6]
        }
    };
    return{
        selectedPlayerNumber:0,
        players:[createPlayer(),createPlayer()],
        getCurrentPlayerData:function(){
          return this.players[this.selectedPlayerNumber];
        },
        computeChampionStats:function(){
          var playerData = this.players[this.selectedPlayerNumber];
          if(playerData.champData.stats != null){
              playerData.championStats.hp = playerData.champData.stats.hp + ((playerData.selectedLevel-1) * playerData.champData.stats.hpperlevel)
              playerData.championStats.mp = playerData.champData.stats.mp + ((playerData.selectedLevel-1) * playerData.champData.stats.mpperlevel)

              playerData.championStats.hpregen = playerData.champData.stats.hpregen + ((playerData.selectedLevel-1) * playerData.champData.stats.hpregenperlevel)
              playerData.championStats.mpregen = playerData.champData.stats.mpregen + ((playerData.selectedLevel-1) * playerData.champData.stats.mpregenperlevel)
              playerData.championStats.attackdamage = playerData.champData.stats.attackdamage + ((playerData.selectedLevel-1) * playerData.champData.stats.attackdamageperlevel)
              playerData.championStats.spelldamage = 0;
              playerData.championStats.armor = playerData.champData.stats.armor + ((playerData.selectedLevel-1) * playerData.champData.stats.armorperlevel)
              playerData.championStats.spellblock = playerData.champData.stats.spellblock + ((playerData.selectedLevel-1) * playerData.champData.stats.spellblockperlevel)
          }
          for(var index in playerData.championItems){
            if(playerData.championItems[index].stats){
              for(var key in playerData.championItems[index].stats){
                  console.log(key)
                  var stat = playerData.championItems[index].stats[key]
                  if(key == "FlatPhysicalDamageMod"){
                    playerData.championStats.attackdamage += stat
                  }
                  if(key == "FlatMagicDamageMod"){
                    playerData.championStats.spelldamage += stat
                  }
              }

            }
          }
        }
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
    return{
        versionData: versionData
    };
}).factory('itemService',function($http){

  var itemData;
  var itemService = {
    getItems: function() {
      if ( !itemData ) {
        // $http returns a promise, which has a then function, which also returns a promise
        itemData = $http.get('http://ddragon.leagueoflegends.com/cdn/3.14.41/data/en_US/item.json').then(function (response) {
          // The then function here is an opportunity to modify the response
          console.log(response);
          // The return value gets picked up by the then in the controller.
          return response.data;
        });
      }
      // Return the promise to the controller
      return itemData;
    }
  };
  return itemService;

});

lolScaleApp.controller('SideController' , ['$scope', 'selectedChampionService',
    function( $scope, selectedChampionService) {
        $scope.selectedChampionService = selectedChampionService;
        $scope.pickSide = function(side){
          $scope.selectedChampionService.selectedPlayerNumber = side;
        };
    }]);

lolScaleApp.controller('ChampionDetailsCtrl' , ['$scope', '$http', 'selectedChampionService', 'itemService', 'versionService',
    function( $scope, $http, selectedChampionService, itemService, versionService) {
        $scope.selectedChampionService = selectedChampionService;
        $scope.versionService = versionService;


        var calculateStats = function(){
            $scope.selectedChampionService.computeChampionStats()
        };
        $scope.$watch('selectedChampionService.players',calculateStats,true);

    }]);

lolScaleApp.controller('ItemSelectionController', ['$scope', 'selectedChampionService','itemService',
  function( $scope, selectedChampionService, itemService) {
    $scope.selectedChampionService = selectedChampionService;
    $scope.itemService = itemService;
    itemService.getItems().then(function(d) {
      $scope.itemData = d.data;
    })
    $scope.currentItemSlot = -1
    $scope.open = function(index) {
      console.log(index)
      $scope.showModal = true;
      $scope.currenItemSlot = index
    };

    $scope.ok = function() {
      $scope.showModal = false;
    };

    $scope.cancel = function() {
      $scope.showModal = false;
      $scope.currentItemSlot = -1
    };
    $scope.selectItem = function(itemKey) {
      $scope.selectedChampionService.getCurrentPlayerData().championItems[$scope.currenItemSlot] = $scope.itemData[itemKey]
      $scope.showModal = false;
      $scope.selectedChampionService.computeChampionStats();
    };

}])
lolScaleApp.controller('CharacterMovesController' , ['$scope', '$sce', 'selectedChampionService', 'versionService',
    function( $scope, $sce, selectedChampionService, versionService) {
        $scope.selectedChampionService = selectedChampionService;
        $scope.versionService = versionService;
        $scope.selectedSpellData = {};
        $scope.selectedLevel = 1;
        $scope.selectedMoveLevel = 1;

        var regex = /{{ (\w+) }}/g;
        var scalingData = {};
        $scope.selectSpell = function(spell){
            $scope.selectedChampionService.getCurrentPlayerData().spellSelectionMade = true;
            $scope.selectedSpellData = $scope.selectedChampionService.getCurrentPlayerData().champData.spells[spell]
            for(var index in $scope.selectedSpellData.vars){
                var spellScalingData = $scope.selectedSpellData.vars[index]
                scalingData[spellScalingData.key] = {"coeff":spellScalingData.coeff,"link":spellScalingData.link}
            }
            for(var index in $scope.selectedSpellData.effect){
              scalingData["e"+index] = $scope.selectedSpellData.effect[index]
            }
        }
        $scope.computeMoveTooltip = function(tooltip) {
            if(tooltip){
              var moveLevel = $scope.selectedMoveLevel
              if($scope.selectedMoveLevel instanceof String){
                moveLevel = $scope.selectedMoveLevel.trim();
              }
              moveLevel -= 1
                while(tooltip.match(regex)){
                    var replacements = regex.exec(tooltip)
                    var damageData;
                    if(scalingData[replacements[1]] instanceof Array){

                      damageData = scalingData[replacements[1]][moveLevel]
                    }
                    else{
                      if(scalingData[replacements[1]]){
                          if(scalingData[replacements[1]].link == "spelldamage"){
                            var spellDamage = $scope.selectedChampionService.getCurrentPlayerData().championStats.spelldamage? $scope.selectedChampionService.getCurrentPlayerData().championStats.spelldamage : 0
                            damageData = scalingData[replacements[1]].coeff * spellDamage
                          }
                          else{
                            var coeff = scalingData[replacements[1]].coeff
                            if(scalingData[replacements[1]].coeff instanceof Array){
                                coeff = scalingData[replacements[1]].coeff[moveLevel]
                            }
                            damageData = coeff * $scope.selectedChampionService.getCurrentPlayerData().championStats.attackdamage
                          }
                      }
                      else{
                        damageData = "X"
                      }
                    }
                    tooltip = tooltip.replace(replacements[0], damageData)
                }
            }
            return $sce.trustAsHtml(tooltip);
          };

    }]);

lolScaleApp.controller('ChampionListCtrl', ['$scope', '$http', 'selectedChampionService', 'versionService',
    function ($scope, $http, selectedChampionService, versionService) {
        $scope.versionService = versionService;
        $http.get("http://ddragon.leagueoflegends.com/cdn/" + $scope.versionService.versionData.champion + "/data/en_US/champion.json").success(function(data){
          $scope.data = data
        });
        $scope.selectedChampionService = selectedChampionService;
        $scope.selectChampion = function(champion) {
          if($scope.selectedChampionService.selectedPlayerNumber == 0 && $scope.selectedChampionService.getCurrentPlayerData().selectionMade == true){
              $scope.selectedChampionService.selectedPlayerNumber = 1;
          }
          $scope.selectedChampionService.getCurrentPlayerData().selectionMade = true;
          $scope.selectedChampionService.getCurrentPlayerData().spellSelectionMade = false;
          $http.get("http://ddragon.leagueoflegends.com/cdn/" + $scope.versionService.versionData.champion + "/data/en_US/champion/" + champion + ".json").success(function(data){
              $scope.selectedChampionService.getCurrentPlayerData().champData = data.data[champion];
              $scope.selectedChampionService.getCurrentPlayerData().champSelection = champion
          });
      }

}]);
