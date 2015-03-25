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
