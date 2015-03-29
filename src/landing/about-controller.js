app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/landing/about.html',
    controller: 'AboutCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/about', routeDefinition);
}])
.controller('AboutCtrl', ['$location', function ($location) {

  var self = this;
  
}]);
