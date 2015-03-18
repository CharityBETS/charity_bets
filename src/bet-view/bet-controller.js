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
        console.log(userService.getCurrent());
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
  self.bet = bet;
  self.currentUser = currentUser;

  self.betOutcomeWin = function (betid) {
     alert("I WON");
     betService.betOutcomeWin(betid, currentUser.id);
  };

  self.betOutcomeLose = function (betid) {
     betService.betOutcomeLose(betid);
  };



}]);
