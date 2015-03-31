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
