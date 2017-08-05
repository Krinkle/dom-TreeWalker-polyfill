/* eslint-env node */
module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			all: {
				files: {
					'dist/TreeWalker-polyfill.min.js': ['src/TreeWalker-polyfill.js']
				},
				options: {
					banner: '/*! TreeWalker v<%= pkg.version %> | krinkle.mit-license.org */\n'
				}
			}
		}
	});
};
