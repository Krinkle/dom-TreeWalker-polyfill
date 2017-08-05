/* eslint-env node, es6 */
var grunt = require('grunt');
module.exports = function (config) {
	var options, suffix;
	suffix = process.env.UNIT_USE_NATIVE ? 'native' : 'polyfill';
	if (process.env.UNIT_USE_MIN) {
		suffix += '-min';
	}

	grunt.log.header('\n' + ('Unit tests (run: ' + suffix + ')').bold + '\n');

	options = {
		// To debug, run `npm run karma-debug`.
		// Then press the "Debug" button in the browser window
		browsers: ['ChromeHeadless'],
		frameworks: ['qunit'],
		client: {
			clearContext: false,
			qunit: {
				showUI: true
			}
		},
		files: [
			'test/qunit-disable-native.js',
			'test/qunit-init.js',
			'src/TreeWalker-polyfill.js',
			'test/TreeWalker.test.js'
		],
		autoWatch: false,
		singleRun: true,
		preprocessors: {
			'src/*.js': ['coverage']
		},
		reporters: ['dots', 'coverage'],
		coverageReporter: {
			reporters: [
				{ type: 'text-summary' },
				{ type: 'html', dir: 'coverage/' + suffix },
				{ type: 'lcovonly', dir: 'coverage/' + suffix }
			]
		}
	};

	if (process.env.UNIT_USE_NATIVE) {
		options.files = options.files.filter(file => file !== 'test/qunit-disable-native.js');
		options.coverageReporter.reporters = options.coverageReporter.reporters.filter(obj => {
			return obj.type === 'lcovonly';
		});
	}

	if (process.env.UNIT_USE_MIN) {
		options.reporters = options.reporters.filter(val => val !== 'coverage');

		options.files = options.files.map(file => {
			return file === 'src/TreeWalker-polyfill.js'
				? 'dist/TreeWalker-polyfill.min.js'
				: file;
		});
	}

	config.set(options);
};
