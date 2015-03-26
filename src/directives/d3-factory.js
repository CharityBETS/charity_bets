// app.factory('d3Service', [function(){
//
//     var data = [{
//         name: "one",
//         value: 75
//       }, {
//         name: "two",
//         value: 25
//       }, ];
//
//       var width = 100;
//         height = width;
//
//       var chart = d3.select("#circle-4")
//         .append('svg')
//         .attr("width", width)
//         .attr("height", height)
//         .append("gh")
//         .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
//
//
//       var radius = Math.min(width, height) / 2;
//
//       var arc = d3.svg.arc()
//         .outerRadius(radius / 2)
//         .innerRadius(radius - 15);
//
//       var pie = d3.layout.pie()
//         .sort(null)
//         .startAngle(0)
//         .endAngle(2 * Math.PI)
//         .value(function (d) {
//         return d.value;
//       });
//
//       var color = d3.scale.ordinal()
//         .range(["#3399FF", "#e1e1e1"]);
//
//       var gh = chart.selectAll(".arc")
//         .data(pie(data))
//         .enter().append("gh")
//         .attr("class", "arc");
//
//       gh.append("path")
//         .attr("fill", function (d, i) {
//         return color(i);
//       })
//         .transition()
//         .ease("exp")
//         .duration(1000)
//         .attrTween("d", dpie);
//
//       function dpie(b) {
//         var i = d3.interpolate({
//             startAngle: 0,
//             endAngle: 1 * Math.PI
//         }, b);
//         return function (t) {
//             return arc(i(t));
//         };
//       }
//
//     return d3;
//   }];
