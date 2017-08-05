/**
 * This file include disables any native TreeWalker in the browser,
 * which ensures that (by default) the tests run against the polyfill.
 */

document.createTreeWalker = undefined;
