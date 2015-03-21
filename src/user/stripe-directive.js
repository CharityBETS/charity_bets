// app.directive('stripeForm', ['$log', function($log) {
//   return function(scope, elem, attrs) {
//
//
//
//     console.log('x');
//     var form =  document.createElement("form");
//     form.action = "charge";
//     form.method = "POST";
//
//     var script =  document.createElement("script");
//     script.src = "https://checkout.stripe.com/checkout.js";
//     script.className = "stripe-button";
//     script.setAttribute("data-key", "pk_test_6pRNASCoBOKtIshFeQd4XMUh");
//     script.setAttribute("data-image", "square-image.png");
//     script.setAttribute("data-name", "Demo Site");
//     script.setAttribute("data-description", "2 widgets ($40.00)");
//     script.setAttribute("data-amount", "4000");
//
//     form.appendChild(script);
//
//     elem.append(angular.element(form));
//
//   };
// }]);
