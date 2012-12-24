/**
 * JavaScript implementation of W3 DOM4 TreeWalker interface.
 *
 * See also:
 * - http://www.w3.org/TR/dom/#interface-treewalker
 * - http://www.w3.org/TR/dom/#dom-document-createtreewalker
 *
 * Attributes like "read-only" and "private" are ignored in this implementation
 * due to ECMAScript 3 (as opposed to ES5) not supporting creation of such properties.
 * There are workarounds, but under "keep it simple" and "don't do stupid things" they
 * are ignored in this implementation.
 */
(function (win, doc) {
	var TreeWalker, NodeFilter, create, toString, is, mapChild, mapSibling,
		traverseChildren, traverseSiblings, nextSkippingChildren;

	if (doc.createTreeWalker) {
		return;
	}

	/* Cross-browser polyfill for these constants */

	NodeFilter = {
		// Constants for acceptNode()
		FILTER_ACCEPT: 1,
		FILTER_REJECT: 2,
		FILTER_SKIP: 3,

		// Constants for whatToShow
		SHOW_ALL: 0xFFFFFFFF,
		SHOW_ELEMENT: 0x1,
		SHOW_ATTRIBUTE: 0x2, // historical
		SHOW_TEXT: 0x4,
		SHOW_CDATA_SECTION: 0x8, // historical
		SHOW_ENTITY_REFERENCE: 0x10, // historical
		SHOW_ENTITY: 0x20, // historical
		SHOW_PROCESSING_INSTRUCTION: 0x40,
		SHOW_COMMENT: 0x80,
		SHOW_DOCUMENT: 0x100,
		SHOW_DOCUMENT_TYPE: 0x200,
		SHOW_DOCUMENT_FRAGMENT: 0x400,
		SHOW_NOTATION: 0x800 // historical
	};

	win.NodeFilter = win.NodeFilter || (NodeFilter.constructor = NodeFilter.prototype = NodeFilter);

	/*
	// FYI only, not used
	Node = {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2, // historical
		TEXT_NODE: 3,
		CDATA_SECTION_NODE: 4, // historical
		ENTITY_REFERENCE_NODE: 5, // historical
		ENTITY_NODE: 6, // historical
		PROCESSING_INSTRUCTION_NODE: 7,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10,
		DOCUMENT_FRAGMENT_NODE: 11,
		NOTATION_NODE: 12 // historical
	};
	*/

	/* Local utilities */

	create = Object.create || function (proto) {
		function Empty() {}
		Empty.prototype = proto;
		return new Empty();
	};

	mapChild = {
		first: 'firstChild',
		last: 'lastChild',
		next: 'firstChild',
		previous: 'lastChild'
	};

	mapSibling = {
		next: 'nextSibling',
		previous: 'previousSibling'
	};

	toString = mapChild.toString;

	is = function (x, type) {
		return toString.call(x).toLowerCase() === '[object ' + type.toLowerCase() + ']';
	};

	/* Private methods and helpers */

	/**
	 * @spec http://www.w3.org/TR/dom/#concept-traverse-children
	 * @method
	 * @access private
	 * @param {TreeWalker} tw
	 * @param {string} type One of 'first' or 'last'.
	 * @return {Node|null}
	 */
	traverseChildren = function (tw, type) {
		var child, node, parent, result, sibling;
		node = tw.currentNode[mapChild[type]];
		while (node !== null) {
			result = tw.filter.acceptNode(node);
			if (result === NodeFilter.FILTER_ACCEPT) {
				tw.currentNode = node;
				return node;
			}
			if (result === NodeFilter.FILTER_SKIP) {
				child = node[mapChild[type]];
				if (child !== null) {
					node = child;
					continue;
				}
			}
			while (node !== null) {
				sibling = node[mapChild[type]];
				if (sibling !== null) {
					node = sibling;
					break;
				}
				parent = node.parentNode;
				if (parent === null || parent === tw.root || parent === tw.currentNode) {
					return null;
				} else {
					node = parent;
				}
			}
		}
		return null;
	};

	/**
	 * @spec http://www.w3.org/TR/dom/#concept-traverse-siblings
	 * @method
	 * @access private
	 * @param {TreeWalker} tw
	 * @param {TreeWalker} type One of 'next' or 'previous'.
	 * @return {Node|nul}
	 */
	traverseSiblings = function (tw, type) {
		var node, result, sibling;
		node = tw.currentNode;
		if (node === tw.root) {
			return null;
		}
		while (true) {
			sibling = node[mapSibling[type]];
			while (sibling !== null) {
				node = sibling;
				result = tw.filter.acceptNode(node);
				if (result === NodeFilter.FILTER_ACCEPT) {
					tw.currentNode = node;
					return node;
				}
				sibling = node[mapChild[type]];
				if (result === NodeFilter.FILTER_REJECT) {
					sibling = node[mapSibling[type]];
				}
			}
			node = node.parentNode;
			if (node === null || node === tw.root) {
				return null;
			}
			if (tw.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
				return null;
			}
		}
	};

	/**
	 * @based on WebKit's NodeTraversal::nextSkippingChildren
	 * https://trac.webkit.org/browser/trunk/Source/WebCore/dom/NodeTraversal.h?rev=137221#L103
	 */
	nextSkippingChildren = function (node, stayWithin) {
		if (node === stayWithin) {
			return null;
		}
		if (node.nextSibling !== null) {
			return node.nextSibling;
		}

		/**
		 * @based on WebKit's NodeTraversal::nextAncestorSibling
		 * https://trac.webkit.org/browser/trunk/Source/WebCore/dom/NodeTraversal.cpp?rev=137221#L43
		 */
		while (node.parentNode !== null) {
			node = node.parentNode;
			if (node === stayWithin) {
				return null;
			}
			if (node.nextSibling !== null) {
				return node.nextSibling;
			}
		}
		return null;
	};

	/* Public API */

	/**
	 * Implemented version: http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#Traversal-TreeWalker
	 * Latest version: http://www.w3.org/TR/dom/#interface-treewalker
	 *
	 * @constructor
	 * @param {Node} root
	 * @param {number} whatToShow [optional]
	 * @param {Function} filter [optional]
	 * @throws Error
	 */
	TreeWalker = function (root, whatToShow, filter) {
		var tw = this, active = false;

		if (!root || !root.nodeType) {
			throw new Error('DOMException: NOT_SUPPORTED_ERR');
		}

		tw.root = root;
		tw.whatToShow = Number(whatToShow) || 0;

		tw.currentNode = root;

		if (!is(filter, 'function')) {
			filter = null;
		}

		tw.filter = create(win.NodeFilter.prototype);

		/**
		 * @method
		 * @param {Node} node
		 * @return {Number} Constant NodeFilter.FILTER_ACCEPT,
		 *  NodeFilter.FILTER_REJECT or NodeFilter.FILTER_SKIP.
		 */
		tw.filter.acceptNode = function (node) {
			var result;
			if (active) {
				throw new Error('DOMException: INVALID_STATE_ERR');
			}

			// Maps nodeType to whatToShow
			if (!(((1 << (node.nodeType - 1)) & tw.whatToShow))) {
				return NodeFilter.FILTER_SKIP;
			}

			if (filter === null) {
				return NodeFilter.FILTER_ACCEPT;
			}

			active = true;
			result = filter(node);
			active = false;

			return result;
		};
	};

	TreeWalker.prototype = {

		constructor: TreeWalker,

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-parentnode
		 * @method
		 * @return {Node|null}
		 */
		parentNode: function () {
			var node = this.currentNode;
			while (node !== null && node !== this.root) {
				node = node.parentNode;
				if (node !== null && this.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
					this.currentNode = node;
					return node;
				}
			}
			return null;
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-firstchild
		 * @method
		 * @return {Node|null}
		 */
		firstChild: function () {
			return traverseChildren(this, 'first');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-lastchild
		 * @method
		 * @return {Node|null}
		 */
		lastChild: function () {
			return traverseChildren(this, 'last');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-previoussibling
		 * @method
		 * @return {Node|null}
		 */
		previousSibling: function () {
			return traverseSiblings(this, 'previous');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-nextsibling
		 * @method
		 * @return {Node|null}
		 */
		nextSibling: function () {
			return traverseSiblings(this, 'next');
		},

		/**
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-previousnode
		 * @method
		 * @return {Node|null}
		 */
		previousNode: function () {
			var node, result, sibling;
			node = this.currentNode;
			while (node !== this.root) {
				sibling = node.previousSibling;
				while (sibling !== null) {
					node = sibling;
					result = this.filter.acceptNode(node);
					while (result !== NodeFilter.FILTER_REJECT && node.lastChild !== null) {
						node = node.lastChild;
						result = this.filter.acceptNode(node);
					}
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
				}
				if (node === this.root || node.parentNode === null) {
					return null;
				}
				node = node.parentNode;
				if (this.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
					this.currentNode = node;
					return node;
				}
			}
			return null; // +
		},

		/**
		 * @based on WebKit's TreeWalker::nextNode
		 * https://trac.webkit.org/browser/trunk/Source/WebCore/dom/TreeWalker.cpp?rev=137221#L253
		 *
		 * @method
		 * @return {Node|null}
		 */
		nextNode: function () {
			var node, result;
			node = this.currentNode;

			children:
			while (true) {
				while (node.firstChild !== null) {
					node = node.firstChild;
					result = this.filter.acceptNode(node);
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
					if (result === NodeFilter.FILTER_REJECT) {
						break;
					}
				}
				
				while ((node = nextSkippingChildren(node, this.root)) !== null) {
					result = this.filter.acceptNode(node);
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
					if (result === NodeFilter.FILTER_SKIP) {
						continue children;
					}
				}
				break;
			}

			return null;
		}
	};

	if (false) {

		/**
		 * FIXME: The specification appears to be broken.
		 * (Run tests to find out)
		 *
		 * @spec http://www.w3.org/TR/dom/#dom-treewalker-nextnode
		 * @method
		 * @return {Node|null}
		 */
		TreeWalker.prototype.nextNode = function () {
			var node, result, following;
			node = this.currentNode;
			result = NodeFilter.FILTER_ACCEPT;

			while (true) {
				while (result !== NodeFilter.FILTER_REJECT && node.firstChild !== null) {
					node = node.firstChild;
					result = this.filter.acceptNode(node);
					if (result === NodeFilter.FILTER_ACCEPT) {
						this.currentNode = node;
						return node;
					}
				}
				following = nextSkippingChildren(node, this.root);
				if (following !== null) {
					node = following;
				} else {
					return null;
				}
				// result = this.filter.acceptNode(node); // +
				if (this.filter.acceptNode(node) === NodeFilter.FILTER_ACCEPT) {
					this.currentNode = node;
					return node;
				}
			}
		};

	}

	/**
	 * @spec http://www.w3.org/TR/dom/#dom-document-createtreewalker
	 * @param {Node} root
	 * @param {number} [whatToShow=NodeFilter.SHOW_ALL]
	 * @param {Function|Object} [filter=null]
	 * @return {TreeWalker}
	 */
	doc.createTreeWalker = function (root, whatToShow, filter) {
		whatToShow = whatToShow === undefined ? NodeFilter.SHOW_ALL : whatToShow;

		if (filter && is(filter.acceptNode, 'function')) {
			filter = filter.acceptNode;
		// Support Gecko-ism of filter being a function.
		// https://developer.mozilla.org/en-US/docs/DOM/document.createTreeWalker
		} else if (!is(filter, 'function')) {
			filter = null;
		}

		return new TreeWalker(root, whatToShow, filter);
	};

}(window, document));
