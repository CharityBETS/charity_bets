app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/user/user-profile.html',
    controller: 'UserCtrl',
    controllerAs: 'vm',
    resolve: {
          currentUser: ['userService', function (userService) {
          return userService.getCurrent().then(function (result) {
            return result.data;
          });
          }],
          currentUserBets: ['userService', function (userService) {
          console.log(userService.getCurrentUserBets());
          return userService.getCurrentUserBets().then(function (result) {
            return result.data;
          });
          }]
      }
  };
  $routeProvider.when('/user/user-profile', routeDefinition);
}])
.controller('UserCtrl', ['$location', 'userService', 'currentUser', 'currentUserBets', '$scope', function ($location, userService, currentUser, currentUserBets, $scope) {

  var self = this;
  self.currentUser = currentUser;
  self.currentUserBets = currentUserBets;
  self.isBetLoser = (currentUser.id === currentUserBets.verified_loser && currentUserBets.loser_paid === "unpaid");
  self.winDonutData = [currentUser.money_won, currentUser.money_lost];
  console.log(self.winDonutData);
  self.goo = [currentUser.money_won, currentUser.money_lost];
  self.gaugeData = [currentUser.win_streak, currentUser.longest_win_streak];
  self.totalMoneyStat = parseInt(currentUser.money_won) + parseInt(currentUser.donation_money_raised);
  self.youGotNoStats = (currentUser.wins === 0);
  self.earningPotential = [currentUser.money_won, currentUser.donation_money_raised];


}]);
