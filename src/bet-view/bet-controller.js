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
