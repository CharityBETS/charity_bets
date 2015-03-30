app.directive('areaChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        // var shit = [ { "x": '2015-03-15' ,"y": 35},{ "x": '2015-03-21', "y": 10}, { "x": '2015-03-31',   "y": 15}  ];
        var dataset = scope.dataset;
        var cleanData = JSON.parse(dataset);

        dataset = cleanData;

        var margin = {top: 20, right: 30, bottom: 60, left: 30};
        var width = 300 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;

        var svg = d3.select(element[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        dataset.forEach(function(d) {
                d.x = parseDate(d.x);
                d.y = +d.y;
            });

        var	x = d3.time.scale().range([0, width]);
        var	y = d3.scale.linear().range([height, 0 ]);


        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function(d)  {  return x(d.x); })
                .y0(height)
                .y1(function(d) {  return y(d.y); });


        var lineFunction = d3.svg.line()
                       .x(function(d) { return x(d.x); })
                       .y(function(d) { return y(d.y); })
                       .interpolate("monotone");



        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);

        var yAxis = d3.svg.axis()
                          .scale(y)
                          .orient("left")
                          .ticks(5);

        x.domain(d3.extent(dataset,  function(d) { return d.x; }));
        y.domain([0, d3.max(dataset, function(d) { return d.y; })]);

        svg.append("path")
        		.attr("class", "area")
        		.attr("d", area(dataset));

        svg.append("path")
                    .attr("class", "line")
                    .attr("d", lineFunction(dataset))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");


        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

            // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.bottom)
            .text("Money Raised");





      }

  };
});
