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
  self.winDonutData = [currentUser.wins, currentUser.losses];
  // self.isAction = function () {
  //   return (currentUserBets.status === "pending" && currentUser.id === currentUserBets.challenger);
  // }
  self.doo = [1000, 650];
  self.goo = [currentUser.money_won, currentUser.money_lost];
  self.userGaugeData = [currentUser.win_streak, currentUser.longest_win_streak]

  $scope.stripeCallback = function (code, result) {
      var buttons = document.querySelector('.form-stripe-button');
      var id = buttons.parentNode.getAttribute('data-id');
      if (result.error) {
          window.alert('it failed! error: ' + result.error.message);
      } else {
          window.alert('success! token: ' + result.id);
          alert(id, result.id);
          userService.sendStripe(id, result.id);
      }
  };





}]);
