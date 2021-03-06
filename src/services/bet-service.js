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
