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
      // comments: ['betService', function (betService) {
      //   return betService.getComments().then(function (result){
      //     return result.data;
      //   });
      // }]
    }
  };
  $routeProvider.when('/bet/:id', routeDefinition);
}])
.controller('ViewBetCtrl', ['$location', 'bet', 'betService', 'currentUser', 'Comment', function ($location, bet, betService, currentUser, Comment) {

  var self = this;
  self.isBettor = (currentUser.id === bet.challenger || currentUser.id  === bet.creator);
  self.bet = bet;
  self.currentUser = currentUser;
  self.showme=true;
  self.isChallengeable = (bet.status === "pending" && currentUser.id === bet.challenger);
  self.comment=Comment();

  self.betOutcomeWin = function (id) {
     betService.betOutcomeWin(bet.id, currentUser.id);
  };

  self.betOutcomeLose = function (id) {
     betService.betOutcomeLose(bet.id);
     self.showme=false;
  };

  self.acceptBet = function (id) {
    betService.acceptBet(bet.id);
  };

  self.addComment = function () {
    betService.addComment(bet.id, self.comment);
    self.comment="";
  }


}]);
