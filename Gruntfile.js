/*jshint node:true */
module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jscs-checker');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['*.js', '{src,test}/**/*.js']
		},
		jscs: {
			all: '<%= jshint.all %>'
		},
		qunit: {
			all: 'test/**/*.html'
		},
		uglify: {
			all: {
				files: {
					'dist/TreeWalker-polyfill.min.js': ['src/TreeWalker-polyfill.js']
				},
				options: {
					banner: '/*! TreeWalker v<%= pkg.version %> | krinkle.mit-license.org */\n'
				}
			}
		},
		watch: {
			files: [
				'.{jscsrc,jshintignore,jshintrc}',
				'<%= jshint.all %>'
			],
			tasks: 'test'
		}
	});

	grunt.registerTask('test', ['jshint', 'jscs', 'qunit', 'uglify']);
	grunt.registerTask('default', 'test');
};
