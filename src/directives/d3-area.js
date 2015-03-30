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

        lineData = cleanData;

        var margin = {top: 20, right: 30, bottom: 50, left: 30};
        var width = 300 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        var	x = d3.scale.linear().range([0, width]);
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



        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(lineData.length);

        var yAxis = d3.svg.axis()
                          .scale(y)
                          .orient("left")
                          .ticks(5);

        x.domain(d3.extent(lineData,  function(d) { return d.x; }));
        y.domain([0, d3.max(lineData, function(d) { return d.y; })]);

        svg.append("path")
        		.attr("class", "area")
        		.attr("d", area(lineData));

        svg.append("path")
                    .attr("class", "line")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");


        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

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
