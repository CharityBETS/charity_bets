// Declare our app module, and import the ngRoute and ngAnimate
// modules into it.
var app = angular.module('app', ['ngRoute']);

// Set up our 404 handler
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.otherwise({
    controller: 'Error404Ctrl',
    controllerAs: 'vm',
    templateUrl: 'static/errors/404/error-404.html'
  });
}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/bet-view/bet.html',
    controller: 'ViewBetCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/bet/', routeDefinition);
}])
.controller('ViewBetCtrl', ['$location', function ($location) {

  var self = this;



}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/bet-view/edit-bet.html',
    controller: 'EditBetCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/bet/edit', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', function ($location) {

  var self = this;



}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/landing/landing.html',
    controller: 'LandingCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/', routeDefinition);
}])
.controller('LandingCtrl', ['$location', function ($location) {

  var self = this;



}]);


app.controller('Error404Ctrl', ['$location', function ($location) {
  this.message = 'Could not find: ' + $location.url();
}]);

//# sourceMappingURL=app.js.map