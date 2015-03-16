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
