[![Build Status](https://travis-ci.org/Krinkle/dom-TreeWalker-polyfill.svg?branch=master)](https://travis-ci.org/Krinkle/dom-TreeWalker-polyfill)
[![Code coverage](https://img.shields.io/codecov/c/github/Krinkle/dom-TreeWalker-polyfill.svg)](https://codecov.io/gh/Krinkle/dom-TreeWalker-polyfill)
[![Tested with QUnit](https://img.shields.io/badge/tested_with-qunit-9c3493.svg)](https://qunitjs.com/)

# DOM TreeWalker polyfill

JavaScript implementation of W3 DOM4 TreeWalker interface for browsers supporting ECMAScript 3 or higher.

## Specification

`TreeWalker`:
* https://dom.spec.whatwg.org/#interface-treewalker
* http://www.w3.org/TR/dom/#interface-treewalker
* http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#Traversal-TreeWalker

`document.createTreeWalker`:
* https://dom.spec.whatwg.org/#dom-document-createtreewalker
* http://www.w3.org/TR/dom/#dom-document-createtreewalker
* http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal.html#NodeIteratorFactory-createTreeWalker

During the development of this polyfill, I noticed a [defect](https://www.w3.org/Bugs/Public/show_bug.cgi?id=20445) in the WHATWG DOM specification ([patch 1](https://github.com/whatwg/dom/commit/ff9acf95c68efe5c6fbc718f814da31b4a891a6a), [patch 2](https://github.com/whatwg/dom/commit/4b60feb14bc91d1d0bcc463eb2b9488bf1071bad)). The finding is acknowledged at <https://dom.spec.whatwg.org/#acks>.

## Tests

By default the tests run against the code in `src/`. Any native TreeWalker
implementation is disabled as part of the test set up.

* To test the native implementation, run `UNIT_USE_NATIVE=true npm test`.
* To test the minified version, run `UNIT_USE_MIN=true npm test`.
* Both, run `UNIT_USE_MIN=true UNIT_USE_NATIVE=true npm test`.
* To debug tests in your browser (instead of Headless), use `npm run karma-debug`. Then press the "Debug" button in the browser window to start the tests.
