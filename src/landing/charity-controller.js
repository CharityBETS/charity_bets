app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/landing/organizations.html',
    controller: 'OrgCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/partners', routeDefinition);
}])
.controller('OrgCtrl', ['$location', function ($location) {

  var self = this;
}]);
