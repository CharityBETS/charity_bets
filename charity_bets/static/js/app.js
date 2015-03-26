// Declare our app module, and import the ngRoute and ngAnimate
// modules into it.
var app = angular.module('app', ['mgcrea.ngStrap', 'angularPayments','ngRoute']);

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

  // self.isVerifiedWinner = function () {
  //   return (bets.winner_name !== null);
  // }


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
      }],
      charities: ['betService', function(betService) {
        return betService.getCharities().then(function (result) {
          console.log(result);
          return result;
        });
      }]
      // comments: ['betService', function (betService) {
      //   return betService.getComments().then(function (result){
      //     return result.data;
      //   });
      // }]
    }
  };
  $routeProvider.when('/bet/:id', routeDefinition);
}])
.controller('ViewBetCtrl', ['$location', 'bet', 'betService', 'currentUser', 'Comment', 'charities', 'Donation', function ($location, bet, betService, currentUser, Comment, charities, Donation) {

  var self = this;
  self.bet = bet;
  self.currentUser = currentUser;
  self.comment=Comment();
  self.donation=Donation();
  self.charities=charities;
  self.modalaction=false;
  self.creatorWinner = function () {
    return (bet.creator === bet.verified_winner);
  };
  self.challengerWinner = function () {
    return (bet.challenger === bet.verified_winner);
  };
  // self.showme=true;

  self.isBettor = function () {
    return (currentUser.id === bet.challenger || currentUser.id  === bet.creator);
  };
  self.isChallengeable = function () {
    return (bet.status === "pending" && currentUser.id === bet.challenger);
  };
  self.isPendingCreator = (bet.status === "pending" && currentUser.id === bet.creator);
  self.isDonator = (bet.status === "complete" && currentUser.id === bet.verified_loser);

  self.isActive = function () {
      return (bet.status === "active");
  };

  self.isWaitingOnCurrentUser = function () {
    var resolverId = Number((bet.challenger_outcome < 0 ? bet.creator_outcome : bet.challenger_outcome || bet.creator_outcome < 0 ? bet.challenger_outcome : bet.creator_outcome));
    return (bet.status === 'unresolved' && resolverId !== currentUser.id);
  };


  self.showResolutionButton = function () {
      return self.isBettor() && (self.isWaitingOnCurrentUser() || self.isActive());
  };


  self.betOutcomeWin = function (id) {
     betService.betOutcomeWin(bet.id, currentUser.id).then(function (result) {
       self.bet=result;
       bet=self.bet
     });
  };

  self.betOutcomeLose = function (id) {
     betService.betOutcomeLose(bet.id);
    //  self.showme=false;
  };

  self.acceptBet = function (charity) {
    betService.acceptBet(bet.id).then(function (result) {
      console.log(result);
      self.bet.status=result.status;
    });
    betService.challengerCharity(bet.id, bet.charity_challenger);
  };

  self.deleteBet = function () {
    betService.deleteBet(bet.id).then(function(result) {
      self.bet = result;
    } );
  };

  self.addComment = function () {
    betService.addComment(bet.id, self.comment).then(function(result) {
      self.comment=result.comment;
    });
    self.comment="";
    location.reload();
  };

  self.sendStripe = function (card) {
    self.betOutcomeLose(currentUser.id);
    console.log(bet);
    Stripe.card.createToken(card, function (status, result) {
      console.log('GOT', result);
      console.log(bet.id)
      betService.sendStripe(self.bet.id, result.id);
      location.reload();
    });
  };

  self.sendStripeDonationCreator = function (card, creatorid, amount) {
      Stripe.card.createToken(card, function (status, result) {
      console.log('GOT', result);
      betService.addDonationCreator(self.bet.id, creatorid, amount, result.id).then(self.goToBet);
      location.reload();
    });
  };

  self.sendStripeDonationChallenger = function (card, challengerid, amount) {
    Stripe.card.createToken(card, function (status, result) {
      console.log('GOT', result);
      betService.addDonationChallenger(self.bet.id, challengerid, amount, result.id).then(self.goToBet);
      location.reload();
    });
  };


  // self.addDonation = function () {
  //   betService.addDonation(self.bet.id, self.Donation).then(self.goToBet);
  // };








}]);

app.factory('Bet', function () {
  return function (spec) {
    spec = spec || {};
    return {
        title: spec.title,
        challenger_name: spec.challenger_name,
        amount: spec.amount,
        date: spec.date,
        location: spec.location,
        description: spec.description,
        charity_creator: spec.charity_creator
    };
  };
});

app.factory('Comment', function () {
  return function (spec) {
    spec = spec || {};
    return {
      comment: spec.comment
      
    };
  };
});

app.factory('Donation', function () {
  return function (spec) {
    spec = spec || {};
    return {
        amount: spec.donation_amount,
        challenger_id: spec.challenger_id,
        creator_id: spec.creator_id,
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
        });
      }],
      users: ['userService', function(userService) {
        return userService.getUsers().then(function (result) {
          console.log(result.data);
          return result.data;
        });
      }],
      charities: ['betService', function(betService) {
        return betService.getCharities().then(function (result) {
          console.log(result);
          return result;
        });
      }]
    }
  };
  $routeProvider.when('/createbet', routeDefinition);
}])
.controller('EditBetCtrl', ['$location', 'Bet', 'betService', 'currentUser', 'users', 'charities', function ($location, Bet, betService, currentUser, users, charities) {

  var self = this;
  self.bet = Bet();
  self.currentUser = currentUser;
  self.users = users;
  self.charities = charities;


  self.addBet = function () {
    betService.addBet(self.bet).then(self.goToBet);
  };

  self.goToBet = function (bet) {
    $location.path('/bet/' + bet.id);
  };

  // self.getUsers = function () {
  //   userService.getUsers();
  // };

  self.cancel = function(e) {
    if (e.keyCode == 27) {
      self.betForm.challengerName.$rollbackViewValue();
    }
  };



}]);

app.directive('betPaymentForm', function() {
  return {
    restrict: 'E',
    templateUrl: 'static/directives/bet-payment-form-temp.html'
  }
});

app.directive('donutChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        var dataset = scope.dataset;

        var width = 320,
           height = 330,
           radius = Math.min(width, height) / 2;

        var color = d3.scale.category20();

        var pie = d3.layout.pie()
          .sort(null);

        var arc = d3.svg.arc()
          .innerRadius(radius - 80)
          .outerRadius(radius - 50);

        var svg = d3.select(element[0]).append("svg")
           .attr("width", width)
           .attr("height", height)
           .append("g")
           .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var path = svg.selectAll("path")
           .data(pie(dataset))
           .enter().append("path")
           .attr("fill", function (d, i) {
             return color(i);
           })
           .attr("d", arc);

      // d3 is the raw d3 object
    }

  }
});

// app.factory('d3Service', [function(){
//
//     var data = [{
//         name: "one",
//         value: 75
//       }, {
//         name: "two",
//         value: 25
//       }, ];
//
//       var width = 100;
//         height = width;
//
//       var chart = d3.select("#circle-4")
//         .append('svg')
//         .attr("width", width)
//         .attr("height", height)
//         .append("gh")
//         .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
//
//
//       var radius = Math.min(width, height) / 2;
//
//       var arc = d3.svg.arc()
//         .outerRadius(radius / 2)
//         .innerRadius(radius - 15);
//
//       var pie = d3.layout.pie()
//         .sort(null)
//         .startAngle(0)
//         .endAngle(2 * Math.PI)
//         .value(function (d) {
//         return d.value;
//       });
//
//       var color = d3.scale.ordinal()
//         .range(["#3399FF", "#e1e1e1"]);
//
//       var gh = chart.selectAll(".arc")
//         .data(pie(data))
//         .enter().append("gh")
//         .attr("class", "arc");
//
//       gh.append("path")
//         .attr("fill", function (d, i) {
//         return color(i);
//       })
//         .transition()
//         .ease("exp")
//         .duration(1000)
//         .attrTween("d", dpie);
//
//       function dpie(b) {
//         var i = d3.interpolate({
//             startAngle: 0,
//             endAngle: 1 * Math.PI
//         }, b);
//         return function (t) {
//             return arc(i(t));
//         };
//       }
//
//     return d3;
//   }];

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: '/static/landing/organizations.html',
    controller: 'OrgCtrl',
    controllerAs: 'vm',
  };
  $routeProvider.when('/organizations', routeDefinition);
}])
.controller('OrgCtrl', ['$location', function ($location) {

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

  function delete(url) {
    return processAjaxPromise($http.delete(url));

  }

  function processAjaxPromise(p) {
    return p.then(function (result) {
      var data = result.data;
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
    },

    deleteBet: function (id) {
      return delete('/api/bets/' + id);
    }

    addComment: function (id, comment) {
      return post('/api/bets/' + id + '/comments', comment);
    },

    getCharities: function () {
      return get('/api/charities');
    },

    challengerCharity: function (id, charity) {
      console.log('/api/bets/' + id, {'charity_challenger': charity});
      return put ('/api/bets/' + id, {'charity_challenger': charity});
    },

    sendStripe: function (betid, resultid) {
      console.log('api/bets/' + betid + '/pay_bet', resultid);
      return post('api/bets/' + betid + '/pay_bet', {'token': resultid});
    },

    addDonationCreator: function(betid, creatorId, amount, resultid) {
      console.log('api/bets/' + betid + '/fund_bettor', {'creatorid': creatorId, 'amount': amount, 'token': resultid});
      return post('api/bets/' + betid + '/fund_bettor', {'creatorid': creatorId, 'amount': amount, 'token': resultid});
    },

    addDonationChallenger: function(betid, challengerId, amount, resultid) {
      return post('api/bets/' + betid + '/fund_bettor', {'challengerid': challengerId, 'amount': amount, 'token': resultid});
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

  function post(url, share) {
    return processAjaxPromise($http.post(url, share));
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
      return get('/api/user/' + userId);
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

    getBetsByUser: function (id) {
      return get ('api/user/' + id + '/bets');
    }

    // sendStripe: function (betid, resultid) {
    //   console.log('api/bets/' + betid + '/pay_bet', resultid);
    //   return post('api/bets/' + betid + '/pay_bet', {'token': resultid});
    // }

  };
}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'static/user/other-users.html',
    controller: 'OtherUserCtrl',
    controllerAs: 'vm',
    resolve: {
          // user: ['userService', '$route', function (userService, $route) {
          //   var id = $route.current.params.id;
          //   return userService.getByUserId(id);
          // }],
          thisUser: ['userService', '$route', function (userService, $route) {
          return userService.getByUserId($route.current.params.id).then(function (result) {
            return result.data;
          });
          }],
          thisUserBets: ['userService', '$route', function (userService, $route) {
          return userService.getBetsByUser($route.current.params.id).then(function (result) {
          console.log(result.data);
            return result.data;
          });
          }]
      }
  };
  $routeProvider.when('/user/user-profile/:id', routeDefinition);
}])
.controller('OtherUserCtrl', ['$location', 'userService', 'thisUser', 'thisUserBets', function ($location, userService, thisUser, thisUserBets) {

  var self = this;
  self.thisUser = thisUser;
  self.thisUserBets = thisUserBets;

}]);

// app.directive('paymentForm', function() {
//   return {
//     restrict: 'E',
//     templateUrl: 'static/directives/user-payment-form-template.html'
//   };
// });

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
  self.foo = [currentUser.wins, currentUser.losses];


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



      $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
      $scope.series = ['Series A', 'Series B'];
      $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];
      $scope.onClick = function (points, evt) {
        console.log(points, evt);
      };



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