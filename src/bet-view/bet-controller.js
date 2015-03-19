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
  self.bet = bet;
  self.currentUser = currentUser;
  self.showme=true;

  self.betOutcomeWin = function (id) {
     betService.betOutcomeWin(bet.id, currentUser.id);
     alert("finished");
  };

  self.betOutcomeLose = function (id) {
     betService.betOutcomeLose(bet.id);
     self.showme=false;
  };



}]);
