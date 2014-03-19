(function($spice, $){
	'use strict';

	var body = $('body');
	$spice(body[0])
		//Header section
		.section()
			.div().$class('row')
				.h1().text('Hello, World').close()
				.each([1,2,3])
					.p().text(function(d){ return d; }).close()
					.p().text(function(d){ return d; }).close()
				.close()
			.close()
		.close()

})(window.$spice, window.$);