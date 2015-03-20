// Declare our app module, and import the ngRoute and ngAnimate
// modules into it.
var app = angular.module('app', ['mgcrea.ngStrap', 'ngRoute']);

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
    controller: 'ViewBetCtrl',
    controllerAs: 'vm',
    templateUrl: '/static/bet-view/bet.html',
    resolve: {
      bet: ['betService', '$route', function (betService, $route) {
        var id = $route.current.params.id;
        return betService.getBet(id);
      }],
      currentUser: ['userService', function (userService) {
        return userService.getCurrent().then(function (result) {
          return result.data;
        });
      }]
    }
  };
  $routeProvider.when('/bet/:id', routeDefinition);
}])
.controller('ViewBetCtrl', ['$location', 'bet', 'betService', 'currentUser',  function ($location, bet, betService, currentUser) {

  var self = this;
  self.isBettor = (currentUser.id === bet.challenger || currentUser.id  === bet.creator);
  self.bet = bet;
  self.currentUser = currentUser;
  self.showme=true;
  self.isChallengeable = (bet.status === "pending" && currentUser.id === bet.challenger);


  self.betOutcomeWin = function (id) {
     betService.betOutcomeWin(bet.id, currentUser.id);
  };

  self.betOutcomeLose = function (id) {
     betService.betOutcomeLose(bet.id);
     self.showme=false;
  };

  self.acceptBet = function (id) {
    alert("I ACCEPT THIS NOBLE CHALLENGE!")
    betService.acceptBet(bet.id);
  };


}]);

app.factory('Bet', function () {
  return function (spec) {
    spec = spec || {};
    return {
        title: spec.title,
        challenger: spec.challenger,
        amount: spec.amount,
        date: spec.date,
        location: spec.location,
        description: spec.description
    };
  };
});

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/bet-view/edit-bet.html',
    controller: 'EditBetCtrl',
    controllerAs: 'vm',
    resolve: {
      currentUser: ['userService', function (userService) {
        return userService.getCurrent().then(function (result) {
          return result.data;
        })
      }],
      users: ['userService', function(userService) {
        return userService.getUsers().then(function (result) {
          return result.data;
        })
      }]
    }
  };
  $routeProvider.when('/createbet', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', 'Bet', 'betService', 'currentUser', 'users', function ($location, Bet, betService, currentUser, users) {

  var self = this;
  self.bet = Bet();
  self.currentUser = currentUser;
  self.users = users;

  self.addBet = function () {
    betService.addBet(self.bet).then(self.goToBet);
  };

  self.goToBet = function (bet) {
    $location.path('/bet/' + bet.id);
  };

  self.getUsers = function () {
    userService.getUsers();
  };


}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/bets/bets.html',
    controller: 'BetsCtrl',
    controllerAs: 'vm',
    resolve: {
      bets: ['betService', function (betService){
        return betService.getBets();
      }]
    }
  };
  $routeProvider.when('/bets', routeDefinition);
}])
.controller('BetsCtrl', ['$location', 'betService', 'bets', function ($location, betService, bets) {

  var self = this;
  self.bets = bets;
  // self.currentUser = currentUser;
  // self.users = users;

  self.goToBet = function (id) {
    $location.path('/bet/' + id );
    };


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

app.controller('MainNavCtrl',
  ['$location', 'StringUtil', 'userService', function($location, StringUtil, userService) {
    var self = this;

    self.isActive = function (path) {
      // The default route is a special case.
      if (path === '/') {
        return $location.path() === '/';
      }
      return StringUtil.startsWith($location.path(), path);
    };

}]);

app.factory('betService', ['$http', '$log', function($http, $log) {

  function get(url) {
    return processAjaxPromise($http.get(url));
  }

  function put(url, bet) {
    return processAjaxPromise($http.put(url, bet));
  }

  function post(url, share) {
    return processAjaxPromise($http.post(url, share));
  }

  function remove(url) {
    return processAjaxPromise($http.delete(url));

  }

  function processAjaxPromise(p) {
    return p.then(function (result) {
      var data = result.data;
      console.log(data);
      return data.data;
    })
    .catch(function (error) {
     $log.log(error);
     throw error;
    });
  }


  return {
    // getBetList: function () {
    //   return get('/api/res');
    // },

    getBet: function (id) {
      return get('/api/bets/' + id);
    },

    addBet: function (bet) {
      return post('/api/user/bets', bet);
    },

    getBets: function () {
      return get('/api/bets');
    },

    betOutcomeWin: function(id, currentuserId) {
      return put('/api/bets/' + id, {"outcome": currentuserId});
    },

    betOutcomeLose: function(id) {
      console.log('/api/bets/' + id);
      return put('/api/bets/' + id, {"outcome": -1});
    },

    acceptBet: function(id) {
      return put('/api/bets/' + id, {"status": "active"});
    }



    // deleteShare: function (id) {
    //   return remove('/api/res/' + id);
    // }
  };
}]);

app.factory('userService', ['$http', '$q', '$log', function($http, $q, $log) {

  function get(url) {
    return processAjaxPromise($http.get(url));
  }

  function processAjaxPromise(p) {
    return p.then(function (result) {
      return result.data;
    })
    .catch(function (error) {
      $log.log(error);
    });
  }

  return {
    getUsers: function () {
      return get('/api/users');
    },

    getByUserId: function (userId) {
      if (!userId) {
        throw new Error('getByUserId requires a user id');
      }

      return get('/api/users/' + userId);
    },

    addUser: function (user) {
      return processAjaxPromise($http.post('/api/users', user));
    },

    getCurrent: function () {
      return get('/api/user/me');
    },

    logOut: function (currentUser) {
      return post('/api/logout');
    },

    getCurrentUserBets: function () {
      return get('/api/user/bets');
    },

    getBetsByUser: function () {
      return get ('api/user/' + id + '/bets');
    }

  };
}]);

app.directive('stripeForm', ['$log', function($log) {
  return function(scope, elem, attrs) {
    console.log('x');
    var form =  document.createElement("form");;
    form.action = "charge";
    form.method = "POST";
    var script =  document.createElement("script");
    script.src = "https://checkout.stripe.com/checkout.js";
    script.className = "stripe-button";
    script.setAttribute("data-key", "pk_test_6pRNASCoBOKtIshFeQd4XMUh");
    script.setAttribute("data-image", "square-image.png");
    script.setAttribute("data-name", "Demo Site");
    script.setAttribute("data-description", "2 widgets ($40.00)");
    script.setAttribute("data-amount", "4000");

    form.appendChild(script);

    elem.append(angular.element(form));
  };
}]);

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
.controller('UserCtrl', ['$location', 'userService', 'currentUser', 'currentUserBets', function ($location, userService, currentUser, currentUserBets) {

  var self = this;
  self.currentUser = currentUser;
  self.currentUserBets = currentUserBets;


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

app.factory('StringUtil', function() {
  return {
    startsWith: function (str, subStr) {
      str = str || '';
      return str.slice(0, subStr.length) === subStr;
    }
  };
});

app.controller('Error404Ctrl', ['$location', function ($location) {
  this.message = 'Could not find: ' + $location.url();
}]);

//# sourceMappingURL=app.js.map