app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/landing/contact.html',
    controller: 'ContactCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/contact', routeDefinition);
}])
.controller('ContactCtrl', ['$location', function ($location) {

  var self = this;

}]);
