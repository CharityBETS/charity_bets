app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/user/user-profile.html',
    controller: 'UserCtrl',
    controllerAs: 'vm',
    resolve: {
          currentUser: ['userService', function (userService) {
          console.log(userService.getCurrent());
          return userService.getCurrent().then(function (result) {
            return result.data;
          });
        }]
      }
  };
  $routeProvider.when('/user/user-profile', routeDefinition);
}])
.controller('UserCtrl', ['$location', 'userService', 'currentUser', function ($location, userService, currentUser) {

  var self = this;
  self.currentUser = currentUser;

  // self.user = User();

  //holds any error messages
  // self.errors = {};
  //
  // self.createUser = function () {
  //   //reset error object for next request
  //   self.errors = {};
  //   userService.createUser(self.user).then(function(success){
  //     $location.path('/tasks');
  //
  //   }, function(error){
  //     // set the errors object for our view
  //     self.errors = error.data;
  //
  //   });
  //
  //   };


}]);
