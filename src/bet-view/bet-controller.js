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
