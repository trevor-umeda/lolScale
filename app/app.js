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
    return{
        selectionMade: false,
        champSelection: '',
        champData: {},
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
        championItems:[1,2,3,4,5,6],
        computeChampionStats:function(){
          if(this.champData.stats != null){
              this.championStats.hp = this.champData.stats.hp + ((this.selectedLevel-1) * this.champData.stats.hpperlevel)
              this.championStats.mp = this.champData.stats.mp + ((this.selectedLevel-1) * this.champData.stats.mpperlevel)

              this.championStats.hpregen = this.champData.stats.hpregen + ((this.selectedLevel-1) * this.champData.stats.hpregenperlevel)
              this.championStats.mpregen = this.champData.stats.mpregen + ((this.selectedLevel-1) * this.champData.stats.mpregenperlevel)
              this.championStats.attackdamage = this.champData.stats.attackdamage + ((this.selectedLevel-1) * this.champData.stats.attackdamageperlevel)
              this.championStats.spelldamage = 0;
              this.championStats.armor = this.champData.stats.armor + ((this.selectedLevel-1) * this.champData.stats.armorperlevel)
              this.championStats.spellblock = this.champData.stats.spellblock + ((this.selectedLevel-1) * this.champData.stats.spellblockperlevel)
          }
          for(var index in this.championItems){
            if(this.championItems[index].stats){
              for(var key in this.championItems[index].stats){
                  console.log(key)
                  var stat = this.championItems[index].stats[key]
                  if(key == "FlatPhysicalDamageMod"){
                    this.championStats.attackdamage += stat
                  }
                  if(key == "FlatMagicDamageMod"){
                    this.championStats.spelldamage += stat
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

    //XRSF seems to cause this to suck
//    $http.get("http://ddragon.leagueoflegends.com/realms/na.json").success(function(data){
//        versionData = data.n;
//        console.log(versionData)
//    });
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

        console.log("TESTING");

        $scope.pickSide = function(side){
          console.log(side)
        };
    }]);

lolScaleApp.controller('ChampionDetailsCtrl' , ['$scope', '$http', 'selectedChampionService', 'itemService', 'versionService',
    function( $scope, $http, selectedChampionService, itemService, versionService) {
        $scope.selectedChampionService = selectedChampionService;
        $scope.versionService = versionService;


        var calculateStats = function(){
            $scope.selectedChampionService.computeChampionStats()
        };
        $scope.$watch('selectedChampionService.selectedLevel',calculateStats,true);
        $scope.$watch('selectedChampionService.champSelection',calculateStats,true);

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
      $scope.selectedChampionService.championItems[$scope.currenItemSlot] = $scope.itemData[itemKey]
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
            $scope.selectedChampionService.spellSelectionMade = true;
            $scope.selectedSpellData = $scope.selectedChampionService.champData.spells[spell]
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
                            var spellDamage = $scope.selectedChampionService.championStats.spelldamage? $scope.selectedChampionService.championStats.spelldamage : 0
                            damageData = scalingData[replacements[1]].coeff * spellDamage
                          }
                          else{
                            var coeff = scalingData[replacements[1]].coeff
                            if(scalingData[replacements[1]].coeff instanceof Array){
                                coeff = scalingData[replacements[1]].coeff[moveLevel]
                            }
                            damageData = coeff * $scope.selectedChampionService.championStats.attackdamage
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

          $scope.selectedChampionService.selectionMade = true;
          $scope.selectedChampionService.spellSelectionMade = false;
          $http.get("http://ddragon.leagueoflegends.com/cdn/" + $scope.versionService.versionData.champion + "/data/en_US/champion/" + champion + ".json").success(function(data){
              $scope.selectedChampionService.champData = data.data[champion];
              $scope.selectedChampionService.champSelection = champion
          });
      }

}]);
