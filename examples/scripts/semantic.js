(function($spice, $){
	'use strict';

	var lorem1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ut nisl in diam hendrerit elementum sit amet id enim. Donec tempus leo sed dapibus malesuada. Donec quis nunc at erat aliquam adipiscing et vitae eros. Maecenas vitae est nisl. Praesent tempus sollicitudin mollis. Maecenas congue laoreet ante, nec dapibus quam fringilla eu. Quisque scelerisque lacus sit amet consectetur sodales. In tristique dolor elit, quis pellentesque orci porttitor eu. Donec interdum vulputate velit, quis euismod mi. Cras lorem lacus, tincidunt non faucibus eget, placerat eu massa. Nunc semper sed risus id scelerisque. Vivamus sed massa porta, molestie metus eu, scelerisque velit. Suspendisse a semper mi, ut condimentum nulla. Donec eget varius elit. Quisque feugiat consectetur lorem, vel ultrices lorem faucibus eget.';
	var lorem2 = 'Maecenas aliquet risus laoreet quam fermentum, quis sagittis metus molestie. Aenean eu mauris orci. Nam lacus lacus, pulvinar eu sapien sed, dapibus mattis velit. Donec a nulla malesuada, tempus mauris vel, ornare dui. Etiam ante eros, adipiscing vitae gravida ut, eleifend sed nulla. Curabitur auctor pharetra consequat. Cras tempus auctor lacus at eleifend. Praesent risus metus, aliquet quis urna at, placerat hendrerit mauris. In congue posuere leo, non mollis dolor rutrum eget. Nullam eu faucibus turpis, a varius velit.';
	var lorem3 = 'Vivamus pellentesque augue lectus, nec euismod nisi lobortis quis. Etiam volutpat vitae felis in rhoncus. Aliquam ac diam eu magna facilisis tempus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In mollis mattis ipsum a mattis. Nunc tortor sapien, vestibulum vitae tempus ut, molestie et libero. Suspendisse venenatis, nisi a dignissim imperdiet, urna ligula gravida quam, quis luctus elit lorem sed erat. Morbi vel sapien nec tortor feugiat porttitor. Nam sed libero lacinia, vestibulum mauris et, congue ipsum. Ut bibendum arcu quis facilisis facilisis. Nullam adipiscing varius aliquam. In tempor ultricies velit quis iaculis. Phasellus feugiat auctor tellus, eu eleifend tellus aliquam eu.';

	var body = $('body');
	$spice(body[0])
		//Navigation
		.header()
			.nav().$class('ui inverted main menu')
				.a().$class('item').href('#').text('Test Page').close()
				
				.div().$class('right menu')
					.a().$class('item').href('#').text('Link 1').close()
					.a().$class('item').href('#').text('Link 2').close()
					.a().$class('item').href('#').text('Link 3').close()
				.close()
			.close()
		.close()
		.section().$class('ui page grid')
			//Header section
			.div().$class('row ui one column grid')
				.div().$class('column')
					.h1().$class('ui header').text('H1').close()
					.h2().$class('ui header').text('H2').close()
					.h3().$class('ui header').text('H3').close()
					.h4().$class('ui header').text('H4').close()
					.h5().$class('ui header').text('H5').close()
					.h6().$class('ui header').text('H6').close()
				.close()
			.close()
			//Alert section
			.div().$class('row ui one column grid')
				.div().$class('column')
					.div().$class('ui blue message')
						.text('Alert!')
						.i().$class('close icon').close()
					.close()
				.close()
			.close()
			//Paragraphs section
			.div().$class('row ui one column grid')
				.div().$class('column')
					.h2().$class('ui header').text('H2 - Section Title').close()
					.p().text(lorem1).close()
					.p().text(lorem2).close()
				.close()
			.close()
			//Grid section
			.div().$class('row ui three column grid')
				.div().$class('column')
					.h4().$class('ui header').text('H4 - Column Title').close()
					.p().text(lorem1).close()
				.close()
				.div().$class('column')
					.h4().$class('ui header').text('H4 - Column Title').close()
					.p().text(lorem2).close()
				.close()
				.div().$class('column')
					.h4().$class('ui header').text('H4 - Column Title').close()
					.p().text(lorem3).close()
				.close()
			.close()
		.close();

})(window.$spice, window.$);