app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    controller: 'ViewBetCtrl',
    controllerAs: 'vm',
    templateUrl: '/static/bet-view/bet.html',
    resolve: {
      bet: ['betService', '$route', function (betService, $route) {
        var id = $route.current.params.id;
        return betService.getBet(id);
      }],
      currentUser: ['userService', function (userService) {
        return userService.getCurrent().then(function (result) {
          return result.data;
        });
      }]
    }
  };
  $routeProvider.when('/bet/:id', routeDefinition);
}])
.controller('ViewBetCtrl', ['$location', 'bet', 'betService', 'currentUser',  function ($location, bet, betService, currentUser) {

  var self = this;
  self.isBettor = (currentUser.id === bet.challenger || currentUser.id  === bet.creator);
  self.bet = bet;
  self.currentUser = currentUser;
  self.showme=true;
  self.isChallengeable = (bet.status === "pending" && currentUser.id === bet.challenger);


  self.betOutcomeWin = function (id) {
     betService.betOutcomeWin(bet.id, currentUser.id);
  };

  self.betOutcomeLose = function (id) {
     betService.betOutcomeLose(bet.id);
     self.showme=false;
  };

  self.acceptBet = function (id) {
    alert("I ACCEPT THIS NOBLE CHALLENGE!")
    betService.acceptBet(bet.id);
  };


}]);
