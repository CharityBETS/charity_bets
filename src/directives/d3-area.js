app.directive('areaChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        // var dataset = scope.dataset;

        var lineData = [ { "x": 0,    "y": 250},  { "x": 40,   "y": 170},
                { "x": 80,   "y": 140},  { "x": 120,  "y": 220},
                { "x": 160,  "y": 220},  { "x": 200,  "y": 190},
                { "x": 240,  "y": 170},  { "x": 280,  "y": 140},
                { "x": 320,  "y": 200},  { "x": 360,  "y": 180},
                { "x": 400,  "y": 190},  { "x": 440,  "y": 210},
                { "x": 480,  "y": 300},  { "x": 500,  "y": 200},
              ];


        var svg = d3.select(element[0]).append("svg")
                                  .attr("width", 300)
                                  .attr("height", 200);


        var area = d3.svg.area()
                       .interpolate("monotone")
           .x(function(d)  {  return x(d.x); })
           .y0(230)
           .y1(function(d) {  return y(d.y); });


        var lineFunction = d3.svg.line()
                      .x(function(d) { return d.x; })
                      .y(function(d) { return d.y; });

        var    x = d3.scale.linear().range([0, 300]);
        var    y = d3.scale.linear().range([0, 200]);

        x.domain(d3.extent(lineData,  function(d) { return d.x; }));
        y.domain([0, d3.max(lineData, function(d) { return d.y; })]);

        svg.append("path")
                .attr("class", "area")
                .attr("d", area(lineData));


        var linegraph = svg.append("path")
                   .attr("d", lineFunction(lineData))
                   .attr("stroke", "red")
                   .attr("stroke-width", 0)
                   .attr("fill", "none");




      }

  };
});
