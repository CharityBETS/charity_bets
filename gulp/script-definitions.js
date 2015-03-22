// This is where any explicit script odering should
// be declared.
module.exports = {
  app: [
    './src/app.js',
    './src/**/!(init.js).js',
    './src/init.js'
  ],

  vendor: [
    "/static/bower_components/angular-payments/lib/angular-payments.js"
  ]
};
