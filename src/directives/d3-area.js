app.directive('areaChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        var lineData = [ { "x": "1-May-16" ,"y": 35},{ "x": "6-May-16",    "y": 10}, { "x": "8-May-16",   "y": 15}  ];

        // var dataset = scope.dataset;

        function getDate(d) {
             return new Date(d.x);
         }

        var margin = {top: 20, right: 30, bottom: 20, left: 30};
        var width = 300 - margin.left - margin.right,
            height = 275 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%d-%b-%y").parse;

        var svg = d3.select(element[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        lineData.forEach(function(d) {
                d.x = parseDate(d.x);
                d.y = +d.y;
            });

        var	x = d3.time.scale().range([0, width]);
        var	y = d3.scale.linear().range([height, 0 ]);


        var area = d3.svg.area()
                .interpolate("monotone")
                .x(function(d)  {  return x(d.x); })
                .y0(230)
                .y1(function(d) {  return y(d.y); });


        var lineFunction = d3.svg.line()
                       .x(function(d) { return x(d.x); })
                       .y(function(d) { return y(d.y); })
                       .interpolate("monotone");



        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(2);

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
                    .attr("stroke", "blue")
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




      }

  };
});
