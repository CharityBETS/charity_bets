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
