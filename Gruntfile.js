module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig(
	{ pkg: grunt.file.readJSON('package.json')
	, concat:
		{ options:
			{ separator: ";\n"
			}
		, build:
			{ src: ['src/spice.js', 'src/spice.html.js']
			, dest: 'build/<%= pkg.name%>.js'
			}
		}
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
		{ src: 'build/<%= pkg.name %>.js'
		, options:
			{ specs: 'spec/*.spec.js'
			, helpers: 'spec/helpers/*.js'
			, vendor: 'public/*.js'
			}
		}
	, watch:
		{ files: ['src/*.js', 'spec/*.js']
		, tasks: ['jasmine']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	// Tasks
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('test', ['jasmine']);
};
