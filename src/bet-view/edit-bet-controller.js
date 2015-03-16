app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/bet-view/edit-bet.html',
    controller: 'EditBetCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/bet/edit', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', 'Bet', 'betService', function ($location, Bet, betService) {

  var self = this;

  self.bet = Bet();

  self.addBet = function () {
    betService.addBet(self.bet).then(self.goToBet);
  };

  self.goToBet = function () {
    console.log("GO TO BET");
    $location.path('/bet');
  };


}]);
