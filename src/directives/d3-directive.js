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
