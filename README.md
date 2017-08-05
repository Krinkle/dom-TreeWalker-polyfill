[![Build Status](https://travis-ci.org/Krinkle/dom-TreeWalker-polyfill.svg?branch=master)](https://travis-ci.org/Krinkle/dom-TreeWalker-polyfill) [![Code coverage](https://img.shields.io/codecov/c/github/Krinkle/dom-TreeWalker-polyfill.svg)](https://codecov.io/gh/Krinkle/dom-TreeWalker-polyfill)

# DOM TreeWalker polyfill

JavaScript implementation of W3 DOM4 TreeWalker interface for browsers supporting ECMAScript 3 or higher.

## See also

`TreeWalker`:
* https://dom.spec.whatwg.org/#interface-treewalker
* http://www.w3.org/TR/dom/#interface-treewalker
* http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#Traversal-TreeWalker

`document.createTreeWalker`:
* https://dom.spec.whatwg.org/#dom-document-createtreewalker
* http://www.w3.org/TR/dom/#dom-document-createtreewalker
* http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#NodeIteratorFactory-createTreeWalker

## Tests

By default the tests run against the code in `src/`. Any native TreeWalker
implementation is disabled as part of the test set up.

* To test the native implementation, run `UNIT_USE_NATIVE=true npm test`.
* To test the minified version, run `UNIT_USE_MIN=true npm test`.
* Both, run `UNIT_USE_MIN=true UNIT_USE_NATIVE=true npm test`.
* To debug tests in your browser (instead of Headless), use `npm run karma-debug`. Then press the "Debug" button in the browser window to start the tests.
