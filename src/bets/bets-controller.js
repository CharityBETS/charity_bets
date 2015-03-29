app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/bets/bets.html',
    controller: 'BetsCtrl',
    controllerAs: 'vm',
    resolve: {
      bets: ['betService', function (betService){
        return betService.getBets();
      }]
    }
  };
  $routeProvider.when('/bets', routeDefinition);
}])
.controller('BetsCtrl', ['$location', 'betService', 'bets', function ($location, betService, bets) {

  var self = this;
  self.bets = bets;
  self.sort = "total_money_raised";
  // self.currentUser = currentUser;
  // self.users = users;

  self.goToBet = function (id) {
    $location.path('/bet/' + id );
    };

  // self.isVerifiedWinner = function () {
  //   return (bets.winner_name !== null);
  // }

  self.sortBetComplete = function (filter, sort) {
    var filter = "complete";
    var sort = self.sort;
    alert(filter, sort);
    betService.filterBet(filter, sort);
  };

  self.sortBetActive = function (filter, sort) {
    var filter = "active";
    var sort = self.sort;
    alert(filter, sort);
    betService.filterBet(filter, sort);
  };

  self.sortBetPending = function (filter, sort) {
    var filter = "pending";
    var sort = self.sort;
    alert(filter, sort);
    betService.filterBet(filter, sort);
  };



}]);
