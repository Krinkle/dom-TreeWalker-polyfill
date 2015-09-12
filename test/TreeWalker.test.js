/*global QUnit */

/**
 * Should be able to simply use `assert.strictEqual(tw.filter.constructor, NodeFilter)`
 * but for some reason this causes bugs in PhantomJS (https://code.google.com/p/phantomjs/issues/detail?id=935)
 *
 * @param {Mixed} actual
 * @param {string} message
 */
QUnit.assert.isNodeFilter = function (actual, message) {
	if (!actual || actual.constructor === NodeFilter) {
		return QUnit.push(actual && actual.constructor === NodeFilter, actual, NodeFilter, message);
	}
	return QUnit.push(actual.FILTER_ACCEPT === 1, actual.FILTER_ACCEPT, 1, message + ' (duck-typing)');
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

	QUnit.push(QUnit.equiv(actualMembers, expected), actualMembers, expected, message);
};

QUnit.module('NodeFilter');

QUnit.test('constants', QUnit.urlParams.useNative ? 3 : 1, function (assert) {
	var tw = document.createTreeWalker(document.body, 0xFFFFFFFF, function () {});

	assert.isNodeFilter(tw.filter, 'filter property is instance of NodeFilter');

	if (QUnit.urlParams.useNative) {
		assert.validNodeFilterConstants(NodeFilter, 'Static members of native NodeFilter');
		assert.validNodeFilterConstants(tw.filter, 'Members of filter object of TreeWalker object');
	}
});

QUnit.module('TreeWalker', {
	setup: function () {
		var fixture = document.getElementById('qunit-fixture'),
			div = document.createElement('div');

		div.innerHTML = '' +
			'<div id="hello">' +
				'Hello ' +
				'<em id="world" title="World: The Title">World</em>' +
			'</div>' +
			'<p id="foo" title="Foo: The Title">' +
				'Foo, ' +
				'<strong id="bar">bar</strong>' +
			'</p>';
		fixture.appendChild(div);

		this.getFixture = function (html) {
			if (html) {
				div.innerHTML = html;
			}
			return div;
		};
	}
});

QUnit.test('constructor()', 2, function (assert) {
	assert.equal(typeof window.TreeWalker, 'function', 'exposed on Window');

	assert.throws(function () {
		return document.createTreeWalker();
	}, 'Invalid arguments');
});

QUnit.test('constructor( Node )', 4, function (assert) {
	var tw;
	tw = document.createTreeWalker(document.body);
	assert.equal(tw.root, document.body, 'root set');
	assert.equal(tw.whatToShow, 0xFFFFFFFF, 'whatToShow default');
	assert.equal(tw.filter, null, 'no filter');
	assert.equal(tw.currentNode, document.body, 'currentNode set');

});

QUnit.test('constructor( Node, NodeFilter )', 4, function (assert) {
	var tw;
	tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	assert.equal(tw.root, document.body, 'root set');
	assert.equal(tw.whatToShow, NodeFilter.SHOW_TEXT, 'whatToShow set');
	assert.equal(tw.filter, null, 'no filter');
	assert.equal(tw.currentNode, document.body, 'currentNode set');

});

QUnit.test('constructor( Node, NodeFilter, null )', 4, function (assert) {
	var tw;
	tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
	assert.equal(tw.root, document.body, 'root set');
	assert.equal(tw.whatToShow, NodeFilter.SHOW_TEXT, 'whatToShow set');
	assert.equal(tw.filter, null, 'no filter');
	assert.equal(tw.currentNode, document.body, 'currentNode set');
});

QUnit.test('constructor( Node, NodeFilter, Function )', 4, function (assert) {
	var tw;
	tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, function () {});
	assert.equal(tw.root, document.body, 'root set');
	assert.equal(tw.whatToShow, NodeFilter.SHOW_TEXT, 'whatToShow set');
	assert.isNodeFilter(tw.filter, 'filter set');
	assert.equal(tw.currentNode, document.body, 'currentNode set');
});

QUnit.test('constructor( Node, NodeFilter, Object )', 4, function (assert) {
	var tw;
	tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function () {} });
	assert.equal(tw.root, document.body, 'root set');
	assert.equal(tw.whatToShow, NodeFilter.SHOW_TEXT, 'whatToShow set');
	assert.isNodeFilter(tw.filter, 'filter set');
	assert.equal(tw.currentNode, document.body, 'currentNode set');
});

QUnit.test('acceptNode: NodeFilter.SHOW_ALL', 1, function (assert) {
	var root, tw, expected, actual;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
	expected = [
		root.firstChild,
		root.firstChild.firstChild,
		root.firstChild.lastChild,
		root.firstChild.lastChild.firstChild,
		root.lastChild,
		root.lastChild.firstChild,
		root.lastChild.lastChild,
		root.lastChild.lastChild.firstChild
	];
	actual = [];

	while (tw.nextNode() !== null) {
		actual.push(tw.currentNode);
	}

	assert.deepEqual(actual, expected);
});

QUnit.test('acceptNode: NodeFilter.SHOW_ELEMENT', 1, function (assert) {
	var root, tw, expected, actual;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	expected = [
		root.firstChild,
		root.firstChild.lastChild,
		root.lastChild,
		root.lastChild.lastChild
	];
	actual = [];

	while (tw.nextNode() !== null) {
		actual.push(tw.currentNode);
	}

	assert.deepEqual(actual, expected);
});

QUnit.test('acceptNode: NodeFilter.SHOW_TEXT', 1, function (assert) {
	var root, tw, expected, actual;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	expected = [
		root.firstChild.firstChild,
		root.firstChild.lastChild.firstChild,
		root.lastChild.firstChild,
		root.lastChild.lastChild.firstChild
	];
	actual = [];

	while (tw.nextNode() !== null) {
		actual.push(tw.currentNode);
	}

	assert.deepEqual(actual, expected);
});

QUnit.test('acceptNode: NodeFilter.SHOW_ALL + Function', 1, function (assert) {
	var root, tw, expected, actual;
	root = this.getFixture(
		'<div title="1." id="one">' +
			'<div title="1.1.">' +
				'<div title="1.1.1." id="one-grantchild"></div>' +
			'</div>' +
		'</div>' +
		'<div title="2."></div>' +
		'<div title="3." id="three"><p title="3.1." id="three-child"></p></div>' +
		'<p title="4." id="four">' +
			'<strong title="4.1.">bar</strong>' +
		'</p>'
	);
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
		acceptNode: function (node) {
			return node.id ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
		}
	});
	expected = [
		root.firstChild,
		root.firstChild.firstChild.firstChild,
		root.lastChild.previousSibling,
		root.lastChild.previousSibling.firstChild,
		root.lastChild
	];
	actual = [];

	while (tw.nextNode() !== null) {
		actual.push(tw.currentNode);
	}

	assert.deepEqual(actual, expected);
});

QUnit.test('acceptNode: NodeFilter.SHOW_ELEMENT + Function + FILTER_REJECT', 1, function (assert) {
	var root, tw, expected, actual;
	root = this.getFixture(
		'<div title="1." id="one">' +
			'<div title="1.1.">' +
				'<div title="1.1.1." id="one-grantchild"></div>' +
			'</div>' +
		'</div>' +
		'<div title="2." id="two"></div>' +
		'<div title="3."><p title="3.1." id="three-child"></p></div>' +
		'<p title="4." id="four">' +
			'<strong title="4.1.">bar</strong>' +
		'</p>'
	);
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
		acceptNode: function (node) {
			return node.id ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
		}
	});

	// TreeWalker should ignore children of node that is given FILTER_REJECT
	// so root.firstChild.firstChild.firstChild (id="one-grantchild") is not expected.
	// and root.lastChild.previousSibling.firstChild (id="three-child") is not expected.
	expected = [
		root.firstChild,
		root.firstChild.nextSibling,
		root.lastChild
	];
	actual = [];

	while (tw.nextNode() !== null) {
		actual.push(tw.currentNode);
	}

	assert.deepEqual(actual, expected);
});

QUnit.test('acceptNode: NodeFilter.SHOW_TEXT + Function', 1, function (assert) {
	var root, tw, expected, actual;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode: function (node) {
			var hasL = /l/.test(node.nodeValue);
			return hasL ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
		}
	});
	expected = [
		root.firstChild.firstChild,
		root.firstChild.lastChild.firstChild
	];
	actual = [];

	while (tw.nextNode() !== null) {
		actual.push(tw.currentNode);
	}

	assert.deepEqual(actual, expected);
});

QUnit.test('.parentNode()', 10, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.parentNode();
	assert.equal(ret, null, 'no parent from root');
	assert.equal(tw.currentNode, root, 'Pointer not moved');

	// Move pointer to <#text>bar</#text>
	tw.currentNode = root.lastChild.lastChild.lastChild;

	ret = tw.parentNode();
	assert.equal(ret.id, 'bar', 'text node to parent');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.parentNode();
	assert.equal(ret.id, 'foo', 'node to parent');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.parentNode();
	assert.equal(ret, root, 'node to parent');
	assert.equal(tw.currentNode, root, 'Pointer moved');

	save = tw.currentNode;
	ret = tw.parentNode();
	assert.equal(ret, null, 'no parent from root');
	assert.equal(tw.currentNode, save, 'Pointer not moved');
});

QUnit.test('.firstChild()', 6, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.firstChild();
	assert.equal(ret.id, 'hello');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.firstChild();
	assert.equal(ret.nodeValue, 'Hello ');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	save = tw.currentNode;
	ret = tw.firstChild();
	assert.equal(ret, null);
	assert.equal(tw.currentNode, save, 'Pointer not moved');

});

QUnit.test('.lastChild()', 8, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.lastChild();
	assert.equal(ret.id, 'foo');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.lastChild();
	assert.equal(ret.id, 'bar');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.lastChild();
	assert.equal(ret.nodeValue, 'bar');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	save = tw.currentNode;
	ret = tw.lastChild();
	assert.equal(ret, null);
	assert.equal(tw.currentNode, save, 'Pointer not moved');
});

QUnit.test('.previousSibling()', 6, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.previousSibling();
	assert.equal(ret, null, 'no sibling from root');
	assert.equal(tw.currentNode, root, 'Pointer not moved');

	tw.currentNode = root.firstChild.firstChild;

	save = tw.currentNode;
	ret = tw.previousSibling();
	assert.equal(ret, null, 'no previous from first child');
	assert.equal(tw.currentNode, save, 'Pointer not moved');

	// Move pointer to id="bar"
	tw.currentNode = root.lastChild.lastChild;

	ret = tw.previousSibling();
	assert.equal(ret.nodeValue, 'Foo, ', 'child to previous child');
	assert.equal(tw.currentNode, ret, 'Pointer moved');
});

QUnit.test('.nextSibling()', 6, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.nextSibling();
	assert.equal(ret, null, 'no sibling from root');
	assert.equal(tw.currentNode, root, 'Pointer not moved');

	tw.currentNode = root.lastChild.lastChild;

	save = tw.currentNode;
	ret = tw.nextSibling();
	assert.equal(ret, null, 'no next from last child');
	assert.equal(tw.currentNode, save, 'Pointer not moved');

	// Move pointer to <#text>Hello </#text>
	tw.currentNode = root.firstChild.firstChild;

	ret = tw.nextSibling();
	assert.equal(ret.id, 'world', 'child to next child');
	assert.equal(tw.currentNode, ret, 'Pointer moved');
});

QUnit.test('.previousNode()', 6, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.previousNode();
	assert.equal(ret, null, 'no sibling from root');
	assert.equal(tw.currentNode, root, 'Pointer not moved');

	// Move pointer to <#text>Foo, </#text>
	tw.currentNode = root.lastChild.firstChild;

	save = tw.currentNode;
	ret = tw.previousNode();
	assert.equal(ret.id, 'foo', 'first child to parent');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.previousNode();
	assert.equal(ret.nodeValue, 'World', 'parent to previous sibling last child');
	assert.equal(tw.currentNode, ret, 'Pointer moved');
});

QUnit.test('.nextNode()', 6, function (assert) {
	var root, tw, ret, save;
	root = this.getFixture();
	tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL);

	ret = tw.nextNode();
	assert.equal(ret.id, 'hello', 'root to first child');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	// Move pointer to id="world"
	tw.currentNode = root.firstChild.lastChild;

	save = tw.currentNode;
	ret = tw.nextNode();
	assert.equal(ret.nodeValue, 'World', 'last child to inner first child');
	assert.equal(tw.currentNode, ret, 'Pointer moved');

	ret = tw.nextNode();
	assert.equal(ret.id || ret.nodeValue, 'foo', 'last child to first child of parent with children');
	assert.equal(tw.currentNode, ret, 'Pointer moved');
});
