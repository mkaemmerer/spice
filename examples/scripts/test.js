(function($spice, $){
	'use strict';

	var body = $('body');
	$spice(body[0])
		//Header section
		.section()
			.div().$class('row')
				.h1().text('Hello, World').close()


				// .p().text(0).close()
				// .p().text(0).close()

				// //Each with vanilla array
				// // .each([1,2,3])
				// // 	.p().text(function(d){ return d; }).close()
				// // 	.p().text(function(d){ return d; }).close()
				// // .close()

				// //Each with events
				// .each(window.Bacon.fromArray([1,2,3]).scan([], '.concat'))
				// 	.p().text(function(d){ return d; }).close()
				// 	.p().text(function(d){ return d; }).close()
				// .close()

				// .p().text(4).close()
				// .p().text(4).close()

				// //If with vanilla boolean
				// .$if(true)
				// 	.p().text('true').close()
				// .$else()
				// 	.p().text('false').close()
				// .close()

				.$if(Bacon.repeatedly(1000, [true, false]))
					.p().text('true').close()
				.$else()
					.p().text('false').close()
				.close()

			.close()
		.close()

})(window.$spice, window.$);