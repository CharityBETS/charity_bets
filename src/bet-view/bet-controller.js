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
.controller('ViewBetCtrl', ['$location', 'bet', 'betService', 'currentUser', 'Comment', '$scope', '$modal', function ($location, bet, betService, currentUser, Comment, $scope, $modal) {

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
  };


  // Pre-fetch an external template populated with a custom scope
  var acceptBetModal = $modal({scope: $scope, template: "/static/modals/challenger-charity.html", show: false});
  // Show when some event occurs (use $promise property to ensure the template has been loaded)
  self.showModal = function() {
    acceptBetModal.$promise.then(acceptBetModal.show);
  };





}]);
