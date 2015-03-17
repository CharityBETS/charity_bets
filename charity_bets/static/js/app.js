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
    controller: 'ViewBetCtrl',
    controllerAs: 'vm',
    templateUrl: '/static/bet-view/bet.html',
    resolve: {
      bet: ['betService', '$route', function (betService, $route) {
        var id = $route.current.params.id;
        return betService.getBet(id);
      }],
      currentUser: ['userService', function (userService) {
        console.log(userService.getCurrent());
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
  self.bet = bet;
  self.currentUser = currentUser;



}]);

app.factory('Bet', function () {
  return function (spec) {
    spec = spec || {};
    return {
        title: spec.title,
        // challenger: spec.challenger,
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
  };
  $routeProvider.when('/createbet', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', 'Bet', 'betService', function ($location, Bet, betService) {

  var self = this;
  self.bet = Bet();

  self.addBet = function () {
    betService.addBet(self.bet).then(self.goToBet);
  };

  self.goToBet = function (bet) {
    console.log(bet);
    $location.path('/bet/' + bet.id);
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
  ['$location', 'StringUtil', function($location, StringUtil) {
    var self = this;

    self.isActive = function (path) {
      // The default route is a special case.
      if (path === '/') {
        return $location.path() === '/';
      }
      return StringUtil.startsWith($location.path(), path);
    };

    //
    // self.goToLogIn = function () {
    //   $location.path('/login');
    // };
  }]);

app.factory('betService', ['$http', '$log', function($http, $log) {

  function get(url) {
    return processAjaxPromise($http.get(url));
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
    listUsers: function () {
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
    }
  };
}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/user/user.html',
    controller: 'UserCtrl',
    controllerAs: 'vm'
    // resolve: {
    //   currentUser: ['userService', function (userService){
    //     return userService.getCurrent();
    //   }]
    //   }
  };
  $routeProvider.when('/users', routeDefinition);
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