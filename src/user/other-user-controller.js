// app.config(['$routeProvider', function($routeProvider) {
//   var routeDefinition = {
//     templateUrl: 'static/user/user-profile.html',
//     controller: 'OtherUserCtrl',
//     controllerAs: 'vm',
//     resolve: {
//           user: ['userService', '$route', function (userService, $route) {
//             var id = $route.current.params.id;
//             return userService.getByUserId(id);
//           }],
//           thisUser: ['userService', function (userService) {
//           return userService.getByUserId.then(function (result) {
//             return result.data;
//           });
//           }],
//           thisUserBets: ['userService', function (userService) {
//           console.log(userService.getBetsByUser());
//           return userService.getBetsByUser.then(function (result) {
//             return result.data;
//           });
//           }]
//       }
//   };
//   $routeProvider.when('/user/:userid', routeDefinition);
// }])
// .controller('OtherUserCtrl', ['$location', 'userService', 'user', 'thisUser', 'thisUserBets', function ($location, userService, user, thisUser, thisUserBets) {
//
//   var self = this;
//   self.thisUser = thisUser;
//   self.thisUserBets = thisUserBets;
//
// }]);
