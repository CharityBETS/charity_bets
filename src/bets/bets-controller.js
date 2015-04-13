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
  self.filterClassName = "bets-filter";
  self.filter="all";
  // self.filter = "all";

  // self.currentUser = currentUser;
  // self.users = users;
  self.filterSort = false;

  self.goToBet = function (id) {
    $location.path('/bet/' + id );
    };

  self.isWinner = function () {
    return (bet.verified_winner !== null);
  };

  // self.isVerifiedWinner = function () {
  //   return (bets.winner_name !== null);
  // }
    // self.betsFilterClassName = false;

  // if (self.filter = 'all') {
  //   self.betsFilterClassName = true;
  // }
  // else if  (self.filter = 'active') {
  //   self.betsFilterClassName = true;
  // }
  // else if (self.filter = 'pending') {
  //   self.betsFilterClassName = true;
  // }
  // else if (self.filter = 'complete') {
  //   self.betsFilterClassName = true;
  // };




  self.filterBetAll = function (filter, sort) {
    var filter = "all";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };


  self.filterBetComplete = function (filter, sort) {
    var filter = "complete";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };


  self.filterBetActive = function (filter, sort) {
    var filter = "active";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };

  self.filterBetPending = function (filter, sort) {
    var filter = "pending";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };


  self.isActiveFilter = function () {
    if (self.betsFilterClassName === "bets-filter") {
      self.betsFilterClassName = "bets-filter-active";
    }  else {
      self.betsFilterClassName = "bets-filter";
    }
  };

  self.sortDate = function () {
    var filter = self.filter;
    var sort = "id";
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };

  self.sortFunding = function () {
    var filter = self.filter;
    var sort = "total_money_raised";
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });

  };

  self.sortBetSize = function () {
    var filter = self.filter;
    var sort = "amount";
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });

  };






}]);
