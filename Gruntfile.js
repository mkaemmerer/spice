module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: "\n\n"
			},
			build: {
				src: ['src/spice.js', 'src/spice.html.js'],
				dest: 'build/<%= pkg.name%>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: ['src/*.js']
    },
    jasmine: {
      src: ['src/spice.js', 'src/spice.html.js'],
      options: {
        specs: 'spec/*spec.js',
        helpers: 'spec/helpers/*.js',
        vendor: ['bower_components/bacon/dist/Bacon.js', 'bower_components/jquery/dist/jquery.js'],
        keepRunner: true
      }
    }
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	// Tasks
	grunt.registerTask('default', ['concat', 'uglify']);
};
