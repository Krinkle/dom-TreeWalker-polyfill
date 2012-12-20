/*jshint node:true */
module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: ['Gruntfile.js', '{src,test}/**/*.js']
		},
		qunit: {
			all: ['test/**/*.html']
		},
		watch: {
			files: ['.jshintrc', '{src,test}/**/*'],
			tasks: 'test'
		},
		uglify: {
			all: {
				files: {
					'dist/TreeWalker-polyfill.min.js': ['src/TreeWalker-polyfill.js']
				},
				options: {
					banner: '/*! TreeWalker v<%= pkg.version %> | github.com/Krinkle */\n'
				}
			}
		},
		'compare_size': {
			files: ['src/TreeWalker-polyfill.js', 'dist/TreeWalker-polyfill.min.js']
		}
	});

	// Load grunt tasks
	grunt.loadNpmTasks('grunt-compare-size');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('test', ['jshint', 'qunit', 'uglify']);
	grunt.registerTask('default', ['test', 'compare_size']);
};
