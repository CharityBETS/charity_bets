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
  self.sort = "total_money_raised";
  self.filterClassName = "bets-filter";
  self.filter="all";
  // self.filter = "all";

  // self.currentUser = currentUser;
  // self.users = users;
  self.filterSort = false;
  self.goToBet = function (id) {
    $location.path('/bet/' + id );
    };

  // self.isVerifiedWinner = function () {
  //   return (bets.winner_name !== null);
  // }
    // self.betsFilterClassName = false;

  // if (self.filter = 'all') {
  //   self.betsFilterClassName = true;
  // }
  // else if  (self.filter = 'active') {
  //   self.betsFilterClassName = true;
  // }
  // else if (self.filter = 'pending') {
  //   self.betsFilterClassName = true;
  // }
  // else if (self.filter = 'complete') {
  //   self.betsFilterClassName = true;
  // };




  self.filterBetAll = function (filter, sort) {
    var filter = "all";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };


  self.filterBetComplete = function (filter, sort) {
    var filter = "complete";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };


  self.filterBetActive = function (filter, sort) {
    var filter = "active";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };

  self.filterBetPending = function (filter, sort) {
    var filter = "pending";
    var sort = self.sort;
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };


  self.isActiveFilter = function () {
    if (self.betsFilterClassName === "bets-filter") {
      self.betsFilterClassName = "bets-filter-active";
    }  else {
      self.betsFilterClassName = "bets-filter";
    }
  };

  self.sortDate = function () {
    var filter = self.filter;
    var sort = "id";
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });
  };

  self.sortFunding = function () {
    var filter = self.filter;
    var sort = "total_money_raised";
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });

  };

  self.sortBetSize = function () {
    var filter = self.filter;
    var sort = "amount";
    betService.filterBet(filter, sort).then(function (result) {
      console.log(result);
      self.bets = result;
    });

  };






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

  self.bet.charity_challenger = '';

  self.currentUser = currentUser;
  self.comment=Comment();
  self.donation=Donation();
  self.charities=charities;
  self.modalaction=false;
  self.creatorData = bet.chart_data.creator_data;
  console.log(self.creatorData);
  self.cleanCreatorData = angular.toJson(self.creatorData);
  self.challengerData = bet.chart_data.challenger_data;
  self.cleanChallengerData = angular.toJson(self.challengerData);
  console.log(self.challengerData);
  self.isNoDonations = (bet.creator_money_raised + bet.challenger_money_raised === 0);

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
      self.goToProfile();
    });
  };

  self.addComment = function () {
    betService.addComment(bet.id, self.comment).then(function(result) {
      console.log(result.comment);
      self.bet.comments.comment=result.comment;
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
    console.log(card);
    Stripe.card.createToken(card, function (status, result) {
      console.log('GOT', result);
      betService.addDonationChallenger(self.bet.id, challengerid, amount, result.id).then(self.goToBet);
      location.reload();
    });
  };

  self.goToProfile = function () {
    $location.path('/user/user-profile');
  };

  self.clearForm = function () {
    self.card.name = "";
    self.card.cvc = "";
    self.card.number = "";
    self.card.exp_month = "";
    self.card.exp_year = "";
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
        charity_creator: spec.charity_creator,
        charity_challenger: ''
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
  self.primaryItems = true;


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

app.directive('charityPie', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {



    var div = d3.select("body").append("div").attr("class", "toolTip");

    var w = 650;
    var h = 400;
    var r = 150;
    var ir = 75;
    var textOffset = 24;
    var tweenDuration = 1050;

    //OBJECTS TO BE POPULATED WITH DATA LATER
    var lines, valueLabels, nameLabels;
    var pieData = [];
    var oldPieData = [];
    var filteredPieData = [];

    //D3 helper function to populate pie slice parameters from array data
    var donut = d3.layout.pie().value(function(d){
      return d.itemValue;
    });

    //D3 helper function to create colors from an ordinal scale
    var color = d3.scale.category20c();

    //D3 helper function to draw arcs, populates parameter "d" in path object
    var arc = d3.svg.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(ir)
      .outerRadius(r);

    ///////////////////////////////////////////////////////////
    // GENERATE FAKE DATA /////////////////////////////////////
    ///////////////////////////////////////////////////////////

    var data;

    var dataStructure = [
       {
          "data":[
             {
                "itemLabel":"Social Media",
                "itemValue":90
             },
             {
                "itemLabel":"Blogs",
                "itemValue":30
             },
             {
                "itemLabel":"Text Messaging",
                "itemValue":60
             },
             {
                "itemLabel":"Email",
                "itemValue":90
             },
          ],
          "label":"2007"
       }
    ];

    ///////////////////////////////////////////////////////////
    // CREATE VIS & GROUPS ////////////////////////////////////
    ///////////////////////////////////////////////////////////

    var vis = d3.select("#pie-chart").append("svg:svg")
      .attr("width", w)
      .attr("height", h);

    //GROUP FOR ARCS/PATHS
    var arc_group = vis.append("svg:g")
      .attr("class", "arc")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    //GROUP FOR LABELS
    var label_group = vis.append("svg:g")
      .attr("class", "label_group")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    //GROUP FOR CENTER TEXT
    var center_group = vis.append("svg:g")
      .attr("class", "center_group")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    //PLACEHOLDER GRAY CIRCLE
    // var paths = arc_group.append("svg:circle")
    //     .attr("fill", "#EFEFEF")
    //     .attr("r", r);

    ///////////////////////////////////////////////////////////
    // CENTER TEXT ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    //WHITE CIRCLE BEHIND LABELS
    var whiteCircle = center_group.append("svg:circle")
      .attr("fill", "white")
      .attr("r", ir);

    ///////////////////////////////////////////////////////////
    // STREAKER CONNECTION ////////////////////////////////////
    ///////////////////////////////////////////////////////////

    // to run each time data is generated
    function update(number) {

      data = dataStructure[number].data;

      oldPieData = filteredPieData;
      pieData = donut(data);

      var sliceProportion = 0; //size of this slice
      filteredPieData = pieData.filter(filterData);
      function filterData(element, index, array) {
        element.name = data[index].itemLabel;
        element.value = data[index].itemValue;
        sliceProportion += element.value;
        return (element.value > 0);
      }

        //DRAW ARC PATHS
        paths = arc_group.selectAll("path").data(filteredPieData);
        paths.enter().append("svg:path")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .attr("fill", function(d, i) { return color(i); })
          .transition()
            .duration(tweenDuration)
            .attrTween("d", pieTween);
        paths
          .transition()
            .duration(tweenDuration)
            .attrTween("d", pieTween);
        paths.exit()
          .transition()
            .duration(tweenDuration)
            .attrTween("d", removePieTween)
          .remove();

    paths.on("mousemove", function(d){
        div.style("left", d3.event.pageX+10+"px");
    		  div.style("top", d3.event.pageY-25+"px");
    		  div.style("display", "inline-block");
        div.html((d.data.itemLabel)+"<br>"+(d.data.itemValue));
    });

    paths.on("mouseout", function(d){
        div.style("display", "none");
    });


        //DRAW TICK MARK LINES FOR LABELS
        lines = label_group.selectAll("line").data(filteredPieData);
        lines.enter().append("svg:line")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", -r-3)
          .attr("y2", -r-15)
          .attr("stroke", "gray")
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
          });
        lines.transition()
          .duration(tweenDuration)
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
          });
        lines.exit().remove();

        //DRAW LABELS WITH PERCENTAGE VALUES
        valueLabels = label_group.selectAll("text.value").data(filteredPieData)
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 5;
            } else {
              return -7;
            }
          })
          .attr("text-anchor", function(d){
            if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
              return "beginning";
            } else {
              return "end";
            }
          })
          .text(function(d){
            var percentage = (d.value/sliceProportion)*100;
            return percentage.toFixed(1) + "%";
          });

        valueLabels.enter().append("svg:text")
          .attr("class", "value")
          .attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
          })
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 5;
            } else {
              return -7;
            }
          })
          .attr("text-anchor", function(d){
            if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
              return "beginning";
            } else {
              return "end";
            }
          }).text(function(d){
            var percentage = (d.value/sliceProportion)*100;
            return percentage.toFixed(1) + "%";
          });

        valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

        valueLabels.exit().remove();


        //DRAW LABELS WITH ENTITY NAMES
        nameLabels = "Eh"
        nameLabels.enter().append("svg:text")
          .attr("class", "units")
          .attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
          })
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 17;
            } else {
              return 5;
            }
          })
          .attr("text-anchor", function(d){
            if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
              return "beginning";
            } else {
              return "end";
            }
          }).text(function(d){
            return d.name;
          });

        nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

        nameLabels.exit().remove();

    }

    ///////////////////////////////////////////////////////////
    // FUNCTIONS //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    // Interpolate the arcs in data space.
    function pieTween(d, i) {
      var s0;
      var e0;
      if(oldPieData[i]){
        s0 = oldPieData[i].startAngle;
        e0 = oldPieData[i].endAngle;
      } else if (!(oldPieData[i]) && oldPieData[i-1]) {
        s0 = oldPieData[i-1].endAngle;
        e0 = oldPieData[i-1].endAngle;
      } else if(!(oldPieData[i-1]) && oldPieData.length > 0){
        s0 = oldPieData[oldPieData.length-1].endAngle;
        e0 = oldPieData[oldPieData.length-1].endAngle;
      } else {
        s0 = 0;
        e0 = 0;
      }
      var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
      return function(t) {
        var b = i(t);
        return arc(b);
      };
    }

    function removePieTween(d, i) {
      s0 = 2 * Math.PI;
      e0 = 2 * Math.PI;
      var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
      return function(t) {
        var b = i(t);
        return arc(b);
      };
    }

    function textTween(d, i) {
      var a;
      if(oldPieData[i]){
        a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI)/2;
      } else if (!(oldPieData[i]) && oldPieData[i-1]) {
        a = (oldPieData[i-1].startAngle + oldPieData[i-1].endAngle - Math.PI)/2;
      } else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
        a = (oldPieData[oldPieData.length-1].startAngle + oldPieData[oldPieData.length-1].endAngle - Math.PI)/2;
      } else {
        a = 0;
      }
      var b = (d.startAngle + d.endAngle - Math.PI)/2;

      var fn = d3.interpolateNumber(a, b);
      return function(t) {
        var val = fn(t);
        return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
      };
    }

    $( "#slider" ).slider({
        value: 0,
        min: 0,
        max: 3,
        step: 1,
        slide: function( event, ui ) {
            update(ui.value);
            console.log(ui.value);
          }
    })
    .each(function() {

      //
      // Add labels to slider whose values
      // are specified by min, max and whose
      // step is set to 1
      //

      // Get the options for this slider
      var opt = $(this).data().uiSlider.options;

      // Get the number of possible values
      var vals = opt.max - opt.min;

      // Space out values
      for (var i = 0; i <= vals; i++) {

        var el = $('<label>'+dataStructure[i].label+'</label>').css('left',(i/vals*100)+'%');

        $( "#slider" ).append(el);

      }

    });

    update(0);

  }

  };
});

app.directive('areaChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        // var shit = [ { "x": '2015-03-15' ,"y": 35},{ "x": '2015-03-21', "y": 10}, { "x": '2015-03-31',   "y": 15}  ];
        var dataset = scope.dataset;
        var cleanData = JSON.parse(dataset);

        lineData = cleanData;
        console.log(lineData);

        var margin = {top: 20, right: 30, bottom: 50, left: 50};
        var width = 300 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select(element[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        var	x = d3.scale.linear().range([0, width]);
        var	y = d3.scale.linear().range([height, 0 ]);


        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function(d)  {  return x(d.x); })
                .y0(height)
                .y1(function(d) {  return y(d.y); });


        var lineFunction = d3.svg.line()
                       .x(function(d) { return x(d.x); })
                       .y(function(d) { return y(d.y); })
                       .interpolate("monotone");



        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(lineData.length);

        var yAxis = d3.svg.axis()
                          .scale(y)
                          .orient("left")
                          .ticks(5);

        x.domain(d3.extent(lineData,  function(d) { return d.x; }));
        y.domain([0, d3.max(lineData, function(d) { return d.y; })]);

        svg.append("path")
        		.attr("class", "area")
        		.attr("d", area(lineData));

        svg.append("path")
                    .attr("class", "line")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");


        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

            // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width/2 + margin.left)
            .attr("y", height + margin.bottom - 10)
            .text("Donations");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left + 1)
            .attr("x", -height/2 +margin.bottom)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Money Raised");



      }

  };
});

app.directive('donutChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {
        console.log(scope.dataset);
        var dataset = scope.dataset;

        var width = 500,
           height = 350,
           radius = Math.min(width, height) / 2;

        var color = d3.scale.category20();

        var pie = d3.layout.pie()
          .sort(null);

        var arc = d3.svg.arc()
          .innerRadius(radius - 70)
          .outerRadius(radius - 50);

        var svg = d3.select(element[0]).append("svg")
           .attr("width", width/2)
           .attr("height", width/2)
           .append("g")
           .attr("transform", "translate(" + width / 4 + "," + width / 4 + ")");


        var path = svg.selectAll("path")
           .data(pie(dataset))
           .enter().append("path")
           .attr("fill", function (d, i) {
             return color(i);
           })
           .attr("d", arc);
            // svg.insert("text", "g")
            // .text("{{vm.currentUser}}")
            // .attr("class", "css-label-class")
            // .attr("text-anchor", "middle");
      }

  };
});

app.directive('gaugeChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        var dataset = scope.dataset;


        // var dataset = {
        //  apples: [53245, 28479, 19697, 24037, 40245],
        // };


        var x = dataset[0];
        var y = dataset[1];
        var winstreak = [x, y-x]
        var percentage = Math.floor((x/y) * 100);


        var width = 500,
           height = 350,
           radius = Math.min(width, height) / 2;

        var color = d3.scale.category20();

        var pie = d3.layout.pie()
           .sort(null)
           pie.startAngle([-1.57079633])
           pie.endAngle([1.57079633]);

        var arc = d3.svg.arc()
           .innerRadius(radius - 100)
           .outerRadius(radius - 50);

        var svg = d3.select(element[0]).append("svg")
           .attr("width", width/ 2)
           .attr("height", height/ 2)
           .append("g")
           .attr("transform", "translate(" + width / 4 + "," + width / 4 + ")");

        // var title = svg.append("text")
        //  .style("color", "#3072a8")
        //  .style("text-anchor", "middle")
        //  .style("text-anchor", "center")
        //  .attr("dy", ".35em")
        //  .attr("class", "inside")
        //  .style("margin-top", "-25px")
        //  .style("font-size", "2em")
        //  .text(function(d) { return x + " vs " + y; })

        var path = svg.selectAll("path")
           .data(pie(winstreak))
         .enter().append("path")
           .attr("fill", function(d, i) { return color(i); })
           .attr("d", arc);


      }

  };
});

// app.directive('moneyBar', function () {
//   return {
//       restrict: "EA",
//       replace: true,
//       scope: {
//         dataset: '='
//       },
//       link: function(scope, element, attrs) {
//
//
//         var dataset = scope.dataset;
//
//         var margins = {
//          top: 12,
//          left: 50,
//          right: 24,
//          bottom: 24
//        },
//
//       width = 400- margins.left - margins.right,
//          height = 70 - margins.top - margins.bottom,
//          dataset = [{
//              data: [{
//                 //  count: varA
//              }],
//          }, {
//              data: [{
//                  count: varB
//              }],
//
//
//      dataset = dataset.map(function (d) {
//            return d.data.map(function (o, i) {
//            // Structure it so that your numeric
//            // axis (the stacked amount) is y
//            return {
//                y: o.count,
//                x: o.money
//            };
//        });
//    }),
//    stack = d3.layout.stack();
//
//       stack(dataset);
//
//     dataset = dataset.map(function (group) {
//          return group.map(function (d) {
//              // Invert the x and y values, and y0 becomes x0
//              return {
//                  x: d.y,
//                  y: d.x,
//                  x0: d.y0
//              };
//          });
//       }),
//          svg = d3.select('body')
//              .append('svg')
//              .attr('width', width + margins.left + margins.right)
//              .attr('height', height + margins.top + margins.bottom)
//              .append('g')
//              .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
//          xMax = d3.max(dataset, function (group) {
//              return d3.max(group, function (d) {
//                  return d.x + d.x0;
//              });
//          }),
//       xScale = d3.scale.linear()
//              .domain([0, xMax])
//              .range([0, width]),
//          money_spent = dataset[0].map(function (d) {
//              return d.y;
//          }),
//          _ = console.log(money_spent),
//          yScale = d3.scale.ordinal()
//              .domain(money_spent)
//              .rangeRoundBands([0, height]),
//
//          yAxis = d3.svg.axis()
//              .scale(yScale)
//              .orient('left'),
//          colors = ["#85bb65 ","#73706F "]
//          groups = svg.selectAll('g')
//              .data(dataset)
//              .enter()
//              .append('g')
//              .style('fill', function (d, i) {
//              return colors[i];
//          }),
//          rects = groups.selectAll('rect')
//              .data(function (d) {
//              return d;
//          })
//              .enter()
//              .append('rect')
//              .attr('x', function (d) {
//              return xScale(d.x0);
//          })
//              .attr('y', function (d, i) {
//              return yScale(d.y);
//          })
//              .attr('height', function (d) {
//              return yScale.rangeBand();
//          })
//              .attr('width', function (d) {
//              return xScale(d.x);
//          })
//              .on('mouseover', function (d) {
//              var xPos = parseFloat(d3.select(this).attr('x')) / 2 + width / 2;
//              var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand() / 2;
//
//              d3.select('#tooltip')
//                  .style('left', xPos + 'px')
//                  .style('top', yPos + 'px')
//                  .select('#value')
//                  .text(d.x);
//
//              d3.select('#tooltip').classed('hidden', false);
//          })
//              .on('mouseout', function () {
//              d3.select('#tooltip').classed('hidden', true);
//          })
//
//          svg.append('g')
//              .attr('class', 'axis')
//              .attr('transform', 'translate(0,' + height + ')')
//              .call();
//
//         svg.append('g')
//            .attr('class', 'axis')
//            .call(yAxis);
//
//         series.forEach(function (s, i) {
//            svg.append('text')
//                .attr('fill', 'black')
//                .attr('x', width + margins.left + 8)
//                .attr('y', i * 24 + 24)
//                .text(s);
//       });
//
//     }
//   }
// });

app.directive('pageslide', [
    function () {
        var defaults = {};

        /* Return directive definition object */

        return {
            restrict: "AC",
            transclude: false,
            scope: {
                psOpen: "=?",
                psAutoClose: "=?",
                psSide: "@",
                psSpeed: "@",
                psClass: "@",
                psSize: "@",
                psSqueeze: "@",
                psCloak: "@"
            },
            //template: '<div class="pageslide-content" ng-transclude></div>',
            link: function ($scope, el, attrs) {
                /* Inspect */
                //console.log($scope);
                //console.log(el);
                //console.log(attrs);

                /* Parameters */
                var param = {};

                param.side = $scope.psSide || 'right';
                param.speed = $scope.psSpeed || '0.5';
                param.size = $scope.psSize || '300px';
                param.zindex = 1000; // Override with custom CSS
                param.className = $scope.psClass || 'ng-pageslide';
                param.cloak = $scope.psCloak && $scope.psCloak.toLowerCase() == 'false' ? false : true;
                param.squeeze = Boolean($scope.psSqueeze) || false;

                // Apply Class
                el.addClass(param.className);

                /* DOM manipulation */
                var content = null;
                var slider = null;
                var body = document.body;

                slider = el[0];

                // Check for div tag
                if (slider.tagName.toLowerCase() !== 'div')
                    throw new Error('Pageslide can only be applied to <div> elements');

                // Check for content
                if (slider.children.length === 0)
                    throw new Error('You have to content inside the <pageslide>');

                content = angular.element(slider.children);

                /* Append */
                body.appendChild(slider);

                /* Style setup */
                slider.style.zIndex = param.zindex;
                slider.style.position = 'fixed'; // this is fixed because has to cover full page
                slider.style.width = 0;
                slider.style.height = 0;
                slider.style.overflow = 'hidden';
                slider.style.transitionDuration = param.speed + 's';
                slider.style.webkitTransitionDuration = param.speed + 's';
                slider.style.transitionProperty = 'width, height';
                if (param.squeeze) {
                    body.style.position = 'absolute';
                    body.style.transitionDuration = param.speed + 's';
                    body.style.webkitTransitionDuration = param.speed + 's';
                    body.style.transitionProperty = 'top, bottom, left, right';
                }

                switch (param.side){
                    case 'right':
                        slider.style.height = attrs.psCustomHeight || '100%';
                        slider.style.top = attrs.psCustomTop ||  '0px';
                        slider.style.bottom = attrs.psCustomBottom ||  '0px';
                        slider.style.right = attrs.psCustomRight ||  '0px';
                        break;
                    case 'left':
                        slider.style.height = attrs.psCustomHeight || '100%';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        break;
                    case 'top':
                        slider.style.width = attrs.psCustomWidth || '100%';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                    case 'bottom':
                        slider.style.width = attrs.psCustomWidth || '100%';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                }


                /* Closed */
                function psClose(slider,param){
                    if (slider && slider.style.width !== 0 && slider.style.width !== 0){
                        if (param.cloak) content.css('display', 'none');
                        switch (param.side){
                            case 'right':
                                slider.style.width = '0px';
                                if (param.squeeze) body.style.right = '0px';
                                break;
                            case 'left':
                                slider.style.width = '0px';
                                if (param.squeeze) body.style.left = '0px';
                                break;
                            case 'top':
                                slider.style.height = '0px';
                                if (param.squeeze) body.style.top = '0px';
                                break;
                            case 'bottom':
                                slider.style.height = '0px';
                                if (param.squeeze) body.style.bottom = '0px';
                                break;
                        }
                    }
                    $scope.psOpen = false;
                }

                /* Open */
                function psOpen(slider,param){
                    if (slider.style.width !== 0 && slider.style.width !== 0){
                        switch (param.side){
                            case 'right':
                                slider.style.width = param.size;
                                if (param.squeeze) body.style.right = param.size;
                                break;
                            case 'left':
                                slider.style.width = param.size;
                                if (param.squeeze) body.style.left = param.size;
                                break;
                            case 'top':
                                slider.style.height = param.size;
                                if (param.squeeze) body.style.top = param.size;
                                break;
                            case 'bottom':
                                slider.style.height = param.size;
                                if (param.squeeze) body.style.bottom = param.size;
                                break;
                        }
                        setTimeout(function(){
                            if (param.cloak) content.css('display', 'block');
                        },(param.speed * 1000));

                    }
                }

                function isFunction(functionToCheck){
                    var getType = {};
                    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
                }

                /*
                * Watchers
                * */

                $scope.$watch("psOpen", function (value){
                    if (!!value) {
                        // Open
                        psOpen(slider,param);
                    } else {
                        // Close
                        psClose(slider,param);
                    }
                });


                /*
                * Events
                * */

                $scope.$on('$destroy', function() {
                    document.body.removeChild(slider);
                });

                if($scope.psAutoClose){
                    $scope.$on("$locationChangeStart", function(){
                        psClose(slider, param);
                    });
                    $scope.$on("$stateChangeStart", function(){
                        psClose(slider, param);
                    });

                }
            }
        };
    }
]);

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

    // self.addToLi = function () {
    //   var navItem = document.querySelector('.')
    //   return
    //     if (isActive) {
    //     }
    // }

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
      return remove('/api/bets/' + id);
    },

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
      console.log('api/bets/' + betid + '/fund_bettor', {'creatorid': challengerId, 'amount': amount, 'token': resultid});
      return post('api/bets/' + betid + '/fund_bettor', {'challengerid': challengerId, 'amount': amount, 'token': resultid});
    },

    filterBet: function (filter, sort) {
        return get ('api/bets/' + filter + '/' + sort);
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
  self.winDonutData = [thisUser.money_won, thisUser.money_lost];
  self.gaugeData = [thisUser.win_streak, thisUser.longest_win_streak];
  self.youGotNoStats = (thisUser.wins === 0);
  self.earningPotential = [thisUser.money_won, thisUser.donation_money_raised];

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
  self.winDonutData = [currentUser.money_won, currentUser.money_lost];
  console.log(self.winDonutData);
  self.goo = [currentUser.money_won, currentUser.money_lost];
  self.gaugeData = [currentUser.win_streak, currentUser.longest_win_streak];
  self.totalMoneyStat = parseInt(currentUser.money_won) + parseInt(currentUser.donation_money_raised);
  self.youGotNoStats = (currentUser.wins === 0);
  self.earningPotential = [currentUser.money_won, currentUser.donation_money_raised];


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