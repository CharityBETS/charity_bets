// This is where any explicit script odering should
// be declared.
module.exports = {
  app: [
    './src/app.js',
    './src/**/!(init.js).js',
    './src/init.js'
  ],

  vendor: [
    "./bower_components/angular-payments/lib/angular-payments.js",
    "./bower_components/chart.js/chart.js",
    "./bower_components/angular-chart.js/dist/angular-chart.js"
  ]
};
