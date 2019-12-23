"use strict";(function () {
  var app = {
    init: function init() {
      svg4everybody();

      console.log("work");
    },
    _getWinSize: function _getWinSize() {
      var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      return { w: w, h: h };
    } };


  app.init();
})();
//# sourceMappingURL=main.js.map
