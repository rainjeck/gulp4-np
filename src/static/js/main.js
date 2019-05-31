class App {
	constructor() {
		svg4everybody();

		console.log('init');

		const viewport = this.getViewport();
	}

	getViewport() {
		return {h: window.innerHeight, w: window.innerWidth};
	}
}

new App();

// (function() {
// 	var app = {
// 		init: function() {

// 			svg4everybody();

// 			console.log('work');
// 		},
// 	};

// 	app.init();
// }());
