"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var App =
/*#__PURE__*/
function () {
  function App() {
    _classCallCheck(this, App);

    svg4everybody();
    console.log('init');
    var viewport = this.getViewport();
  }

  _createClass(App, [{
    key: "getViewport",
    value: function getViewport() {
      return {
        h: window.innerHeight,
        w: window.innerWidth
      };
    }
  }]);

  return App;
}();

new App(); // (function() {
// 	var app = {
// 		init: function() {
// 			svg4everybody();
// 			console.log('work');
// 		},
// 	};
// 	app.init();
// }());
//# sourceMappingURL=main.js.map
