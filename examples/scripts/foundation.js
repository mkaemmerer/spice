(function($spice, $){
	'use strict';

	var lorem1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ut nisl in diam hendrerit elementum sit amet id enim. Donec tempus leo sed dapibus malesuada. Donec quis nunc at erat aliquam adipiscing et vitae eros. Maecenas vitae est nisl. Praesent tempus sollicitudin mollis. Maecenas congue laoreet ante, nec dapibus quam fringilla eu. Quisque scelerisque lacus sit amet consectetur sodales. In tristique dolor elit, quis pellentesque orci porttitor eu. Donec interdum vulputate velit, quis euismod mi. Cras lorem lacus, tincidunt non faucibus eget, placerat eu massa. Nunc semper sed risus id scelerisque. Vivamus sed massa porta, molestie metus eu, scelerisque velit. Suspendisse a semper mi, ut condimentum nulla. Donec eget varius elit. Quisque feugiat consectetur lorem, vel ultrices lorem faucibus eget.';
	var lorem2 = 'Maecenas aliquet risus laoreet quam fermentum, quis sagittis metus molestie. Aenean eu mauris orci. Nam lacus lacus, pulvinar eu sapien sed, dapibus mattis velit. Donec a nulla malesuada, tempus mauris vel, ornare dui. Etiam ante eros, adipiscing vitae gravida ut, eleifend sed nulla. Curabitur auctor pharetra consequat. Cras tempus auctor lacus at eleifend. Praesent risus metus, aliquet quis urna at, placerat hendrerit mauris. In congue posuere leo, non mollis dolor rutrum eget. Nullam eu faucibus turpis, a varius velit.';
	var lorem3 = 'Vivamus pellentesque augue lectus, nec euismod nisi lobortis quis. Etiam volutpat vitae felis in rhoncus. Aliquam ac diam eu magna facilisis tempus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In mollis mattis ipsum a mattis. Nunc tortor sapien, vestibulum vitae tempus ut, molestie et libero. Suspendisse venenatis, nisi a dignissim imperdiet, urna ligula gravida quam, quis luctus elit lorem sed erat. Morbi vel sapien nec tortor feugiat porttitor. Nam sed libero lacinia, vestibulum mauris et, congue ipsum. Ut bibendum arcu quis facilisis facilisis. Nullam adipiscing varius aliquam. In tempor ultricies velit quis iaculis. Phasellus feugiat auctor tellus, eu eleifend tellus aliquam eu.';

	var body = $('body');
	$spice(body[0])
		.nav().$class('top-bar')
			//Left nav section
			.ul().$class('title-area')
				.li().$class('name')
					.h1()
						.a().href('#').text('Test Page').close()
					.close()
				.close()
			.close()
			//Right nav section
			.section().$class('top-bar-section')
				.ul().$class('right')
					.li().$class('divider').close()
					.li()
						.a().href('#')
							.text('link 1')
						.close()
					.close()
					.li()
						.a().href('#')
							.text('link 2')
						.close()
					.close()
					.li().$class('divider').close()
					.li()
						.a().href('#')
							.text('link 3')
						.close()
					.close()
				.close()
			.close()
		.close()
		//Header section
		.section()
			.div().$class('row')
				.h1().text('H1 - Hello, World').close()
				.h2().text('H2 - Hello, World').close()
				.h3().text('H3 - Hello, World').close()
				.h4().text('H4 - Hello, World').close()
				.h5().text('H5 - Hello, World').close()
				.h6().text('H6 - Hello, World').close()
			.close()
		.close()
		//Alert section
		.section()
			.div().$class('row')
				.div().$class('alert-box')
					.text('Alert!')
					.a().$class('close').href('#').text('×').close()
				.close()
			.close()
		.close()
		//Paragraphs section
		.section()
			.div().$class('row')
				.h2().text('H2 - Hello, World').close()
				.p().text(lorem1).close()
				.p().text(lorem2).close()
			.close()
		.close()
		//3 column section
		.section()
			.div().$class('row')
				.div().$class('large-4 columns')
					.h3().text('H3 - Hello, World').close()
					.p().text(lorem1).close()
				.close()
				.div().$class('large-4 columns')
					.h3().text('H3 - Hello, World').close()
					.p().text(lorem2).close()
				.close()
				.div().$class('large-4 columns')
					.h3().text('H3 - Hello, World').close()
					.p().text(lorem3).close()
				.close()
			.close()
		.close()


})(window.$spice, window.$);