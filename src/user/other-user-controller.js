app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/user/other-users.html',
    controller: 'OtherUserCtrl',
    controllerAs: 'vm',
    resolve: {
          // user: ['userService', '$route', function (userService, $route) {
          //   var id = $route.current.params.id;
          //   return userService.getByUserId(id);
          // }],
          thisUser: ['userService', '$route', function (userService, $route) {
          return userService.getByUserId($route.current.params.id).then(function (result) {
            return result.data;
          });
          }],
          thisUserBets: ['userService', '$route', function (userService, $route) {
          return userService.getBetsByUser($route.current.params.id).then(function (result) {
          console.log(result.data);
            return result.data;
          });
          }]
      }
  };
  $routeProvider.when('/user/user-profile/:id', routeDefinition);
}])
.controller('OtherUserCtrl', ['$location', 'userService', 'thisUser', 'thisUserBets', function ($location, userService, thisUser, thisUserBets) {

  var self = this;
  self.thisUser = thisUser;
  self.thisUserBets = thisUserBets;

}]);
