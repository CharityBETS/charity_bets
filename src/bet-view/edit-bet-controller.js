app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/bet-view/edit-bet.html',
    controller: 'EditBetCtrl',
    controllerAs: 'vm',
    resolve: {
      currentUser: ['userService', function (userService) {
        return userService.getCurrent().then(function (result) {
          return result.data;
        });
      }],
      users: ['userService', function(userService) {
        return userService.getUsers().then(function (result) {
          console.log(result.data);
          return result.data;
        });
      }],
      charities: ['betService', function(betService) {
        return betService.getCharities().then(function (result) {
          console.log(result);
          return result;
        });
      }]
    }
  };
  $routeProvider.when('/createbet', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', 'Bet', 'betService', 'currentUser', 'users', 'charities', function ($location, Bet, betService, currentUser, users, charities) {

  var self = this;
  self.bet = Bet();
  self.currentUser = currentUser;
  self.users = users;
  self.charities = charities;
  self.primaryItems = true;


  self.addBet = function () {
    betService.addBet(self.bet).then(self.goToBet);
  };

  self.goToBet = function (bet) {
    $location.path('/bet/' + bet.id);
  };

  // self.getUsers = function () {
  //   userService.getUsers();
  // };

  self.cancel = function(e) {
    if (e.keyCode == 27) {
      self.betForm.challengerName.$rollbackViewValue();
    }
  };



}]);
