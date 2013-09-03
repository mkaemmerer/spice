module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig(
	{ pkg: grunt.file.readJSON('package.json')
	, uglify:
		{ options:
			{ banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
		, build:
			{ src: 'src/<%= pkg.name %>.js'
			, dest: 'build/<%= pkg.name %>.min.js'
			}
		}
	, jasmine:
		{ src: 'src/*.js'
		, options:
			{ specs: 'spec/*.spec.js'
			, helpers: 'spec/helpers/*.js'
			, vendor: 'public/*.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	// Tasks
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('test', ['jasmine']);
};
