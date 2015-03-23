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
  // self.thisBetId = angular.element(document.querySelector('.user-stripe-form'))
  // var stripeButton = document.querySelector('.form-stripe-button');
  // var id;
  // stripeButton.addEventListener("click", function (e) {
  //   var button = e.target;
  //   id = button.parentNode.getAttribute('data-id');
  // });
  // console.log(id);
  // var thisStripeId = this.aStripeForm.getAttribute('data-id');
  // var thisStripeId = this.aStripeForm.data('id');



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

  self.stripeTest = function (dataID) {
    alert(dataID);
  };
  
  // self.sendStripe = function (id) {
  //  alert("striping!");
  //  userService.sendStripe(id);
  // }



  // app.directive('stripeForm', ['$log', function($log) {
  //   return function(scope, elem, attrs) {
  //     console.log('x');
  //     var form =  document.createElement("form");;
  //     form.action = "charge";
  //     form.method = "POST";
  //     var script =  document.createElement("script");
  //     script.src = "https://checkout.stripe.com/checkout.js";
  //     script.className = "stripe-button";
  //     script.setAttribute("data-key", "pk_test_6pRNASCoBOKtIshFeQd4XMUh");
  //     script.setAttribute("data-image", "square-image.png");
  //     script.setAttribute("data-name", "Demo Site");
  //     script.setAttribute("data-description", "2 widgets ($20.00)");
  //     script.setAttribute("data-amount", "2000");
  //
  //     form.appendChild(script);
  //
  //     elem.append(angular.element(form));
  //   };
  // }]);



}]);
