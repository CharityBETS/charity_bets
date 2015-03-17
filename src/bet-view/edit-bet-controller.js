app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/bet-view/edit-bet.html',
    controller: 'EditBetCtrl',
    controllerAs: 'vm',
<<<<<<< HEAD
    users: ['userService', function(userService) {
      return userService.getUsers();
    }]
=======
    resolve: {
      currentUser: ['userService', function (userService) {
        return userService.getCurrent().then(function (result) {
          return result.data;
        })
      }],
      users: ['userService', function(userService) {
        return userService.getUsers();
      }]
    }
>>>>>>> current-user
  };
  $routeProvider.when('/createbet', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', 'Bet', 'betService', 'currentUser', 'users', function ($location, Bet, betService, currentUser, users) {

  var self = this;
  self.bet = Bet();
  self.currentUser = currentUser;
  self.users = users;

  self.addBet = function () {
    betService.addBet(self.bet).then(self.goToBet);
  };

  self.goToBet = function (bet) {
    $location.path('/bet/' + bet.id);
  };

  self.getUsers = function () {
    userService.getUsers();
  };


}]);
