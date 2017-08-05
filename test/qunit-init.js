/* eslint-env qunit */

/* Config */

QUnit.config.reorder = false;

/* Assert extension */

/**
 * Should be able to simply use `assert.strictEqual(tw.filter.constructor, NodeFilter)`
 * but for some reason this causes bugs in PhantomJS (https://code.google.com/p/phantomjs/issues/detail?id=935)
 *
 * @param {Mixed} actual
 * @param {string} message
 */
QUnit.assert.isNodeFilter = function (actual, message) {
	var result = typeof actual === 'function' ||  (
		typeof actual === 'object' && typeof actual.acceptNode === 'function'
	);
	return this.pushResult({
		result: result,
		actual: actual,
		expected: 'function',
		message: message
	});
};

QUnit.assert.validNodeFilterConstants = function (actual, message) {
	var actualMembers, expected, key;
	expected = {
		FILTER_ACCEPT: 1,
		FILTER_REJECT: 2,
		FILTER_SKIP: 3,

		SHOW_ALL: 0xFFFFFFFF,
		SHOW_ELEMENT: 0x1,
		SHOW_ATTRIBUTE: 0x2,
		SHOW_TEXT: 0x4,
		SHOW_CDATA_SECTION: 0x8,
		SHOW_ENTITY_REFERENCE: 0x10,
		SHOW_ENTITY: 0x20,
		SHOW_PROCESSING_INSTRUCTION: 0x40,
		SHOW_COMMENT: 0x80,
		SHOW_DOCUMENT: 0x100,
		SHOW_DOCUMENT_TYPE: 0x200,
		SHOW_DOCUMENT_FRAGMENT: 0x400,
		SHOW_NOTATION: 0x800
	};

	actualMembers = {};
	for (key in expected) {
		if (expected.hasOwnProperty(key)) {
			actualMembers[key] = actual[key];
		}
	}

	this.pushResult({
		result: QUnit.equiv(actualMembers, expected),
		actual: actualMembers,
		expected: expected,
		message: message
	});
};
