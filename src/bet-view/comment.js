app.factory('Comment', function () {
  return function (spec) {
    spec = spec || {};
    return {
      comment: spec.comment
      
    };
  };
});
