app.directive('moneyBar', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {


        var dataset = scope.dataset;

        var margins = {
         top: 12,
         left: 50,
         right: 24,
         bottom: 24
       },

      width = 500 - margins.left - margins.right,
         height = 70 - margins.top - margins.bottom,
         dataset = [{
             data: [{
                 count: 600
             }],
         }, {
             data: [{
                 count: 235
             }],
         }],

    dataset = dataset.map(function (d) {
           return d.data.map(function (o, i) {
           // Structure it so that your numeric
           // axis (the stacked amount) is y
           return {
               y: o.count,
               x: o.money
           };
       });
   }),
   stack = d3.layout.stack();

      stack(dataset);

    dataset = dataset.map(function (group) {
         return group.map(function (d) {
             // Invert the x and y values, and y0 becomes x0
             return {
                 x: d.y,
                 y: d.x,
                 x0: d.y0
             };
         });
      }),
         svg = d3.select('body')
             .append('svg')
             .attr('width', width + margins.left + margins.right)
             .attr('height', height + margins.top + margins.bottom)
             .append('g')
             .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
         xMax = d3.max(dataset, function (group) {
             return d3.max(group, function (d) {
                 return d.x + d.x0;
             });
         }),
      xScale = d3.scale.linear()
             .domain([0, xMax])
             .range([0, width]),
         money_spent = dataset[0].map(function (d) {
             return d.y;
         }),
         _ = console.log(money_spent),
         yScale = d3.scale.ordinal()
             .domain(money_spent)
             .rangeRoundBands([0, height]),

         yAxis = d3.svg.axis()
             .scale(yScale)
             .orient('left'),
         colors = ["#85bb65 ","#73706F "]
         groups = svg.selectAll('g')
             .data(dataset)
             .enter()
             .append('g')
             .style('fill', function (d, i) {
             return colors[i];
         }),
         rects = groups.selectAll('rect')
             .data(function (d) {
             return d;
         })
             .enter()
             .append('rect')
             .attr('x', function (d) {
             return xScale(d.x0);
         })
             .attr('y', function (d, i) {
             return yScale(d.y);
         })
             .attr('height', function (d) {
             return yScale.rangeBand();
         })
             .attr('width', function (d) {
             return xScale(d.x);
         })
             .on('mouseover', function (d) {
             var xPos = parseFloat(d3.select(this).attr('x')) / 2 + width / 2;
             var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand() / 2;

             d3.select('#tooltip')
                 .style('left', xPos + 'px')
                 .style('top', yPos + 'px')
                 .select('#value')
                 .text(d.x);

             d3.select('#tooltip').classed('hidden', false);
         })
             .on('mouseout', function () {
             d3.select('#tooltip').classed('hidden', true);
         })

         svg.append('g')
             .attr('class', 'axis')
             .attr('transform', 'translate(0,' + height + ')')
             .call();

        svg.append('g')
           .attr('class', 'axis')
           .call(yAxis);

        series.forEach(function (s, i) {
           svg.append('text')
               .attr('fill', 'black')
               .attr('x', width + margins.left + 8)
               .attr('y', i * 24 + 24)
               .text(s);
      });

    }
  }
});
