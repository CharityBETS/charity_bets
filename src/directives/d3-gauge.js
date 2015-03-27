app.directive('gaugeChart', function () {
  return {
      restrict: "EA",
      replace: true,
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {

        // var dataset = scope.dataset;

        var x = 6
        var y = 10
        var winstreak = ['Win Streak', x]
        var longest = ['Longest Win Streak', y-x]

$('#container').highcharts({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false
    },
    title: {
        text: 'Current Winstreak<br>vs.<br>Longest Winstreak',
        align: 'center',
        verticalAlign: 'middle',
        y: 50
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            dataLabels: {
                enabled: true,
                distance: -50,
                style: {
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0px 1px 2px black'
                }
            },
            startAngle: -90,
            endAngle: 90,
            center: ['50%', '75%']
        }
    },
    series: [{
        type: 'pie',
        name: 'Completion Percent:',
        innerSize: '55%',
        data: [
            winstreak,
            longest,
            {
                y: 0,
                dataLabels: {
                    enabled: false
                }
            }
        ]
    }]
});






      }

  };
});
