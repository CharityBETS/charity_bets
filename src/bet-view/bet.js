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
