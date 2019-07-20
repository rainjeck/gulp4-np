(() => {
  let app = {
    init: () => {
      svg4everybody();

      console.log("work");
    },
    _getWinSize: () => {
      const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      return {w, h};
    }
  };

  app.init();
})();
