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
