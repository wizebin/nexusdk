(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("nexusdk", [], factory);
	else if(typeof exports === 'object')
		exports["nexusdk"] = factory();
	else
		root["nexusdk"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: object, nexusdk, wrapAction, wrapHook, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"nexusdk\", function() { return nexusdk; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"wrapAction\", function() { return wrapAction; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"wrapHook\", function() { return wrapHook; });\n/* harmony import */ var _objectUtility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectUtility */ \"./src/objectUtility.js\");\n/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, \"object\", function() { return _objectUtility__WEBPACK_IMPORTED_MODULE_0__; });\n\n\n\nconst env = {};\n\nconst IPC = 1;\nconst SOCKET = 2;\n\nclass nexusdk {\n  constructor({ id, name } = {}) {\n    this.errors = [];\n    this.onInternalMessage = this.onInternalMessage.bind(this);\n    this.onReceiveMessage = this.onReceiveMessage.bind(this);\n    this.sendMessage = this.sendMessage.bind(this);\n    if (typeof global.process !== 'undefined') {\n      this.communicationType = IPC;\n      this.process = global.process;\n      this.process.on('message', this.onReceiveMessage);\n    }\n    this.hook = { id, name };\n    this.callbacks = { internal: this.onInternalMessage };\n  }\n\n  onInternalMessage(message) {\n    const { name, data } = message;\n    if (name === 'meta') {\n      this.meta = data;\n    } else if (name === 'set_hook') {\n      this.hook = data;\n    }\n  }\n\n  sendData(message) {\n    if (this.communicationType === IPC) {\n      this.process.send({ meta: this.meta, hook: this.hook, time: new Date().toISOString(), message });\n    }\n  }\n\n  sendMessage(type, data) {\n    return this.sendData({ type, data });\n  }\n\n  onReceiveMessage(message) {\n    const { type, data } = message;\n\n    const callback = this.callbacks[type];\n    if (callback) {\n      callback(data, { type });\n    }\n  }\n\n  on(messageName, callback) {\n    if (messageName === 'internal') {\n      console.error('The internal callback is reserved');\n    }\n    this.callbacks[messageName] = callback;\n  }\n};\n\nconst sdk = new nexusdk();\n\nfunction wrapAction(actionFunction, configuration) {\n  function exit(code) {\n    sdk.sendMessage('exit', code);\n    process.exit(code);\n  }\n  sdk.on('start', (properties) => {\n    try {\n      const result = actionFunction(properties, (type, msg) => sdk.sendMessage(type, msg));\n      if (result instanceof Promise) {\n        result.then(result => {\n          sdk.sendMessage('result', result)\n          exit(0);\n        });\n      } else {\n        sdk.sendMessage('result', result);\n        exit(0);\n      }\n    } catch (err) {\n      sdk.sendMessage('error', Object.getOwnPropertyNames(err));\n      exit(1);\n    }\n  });\n\n  sdk.on('configuration', () => {\n    sdk.sendMessage('configuration', configuration);\n  });\n\n  sdk.on('exit', () => {\n    exit(0);\n  });\n}\n\nfunction wrapHook(hookFunction, configuration) {\n  sdk.on('start', (properties) => {\n    try {\n      const result = hookFunction(properties, (type, msg) => sdk.sendMessage(type, msg));\n    } catch (err) {\n      sdk.sendMessage('error', Object.getOwnPropertyNames(err));\n    }\n  });\n\n  sdk.on('configuration', () => {\n    sdk.sendMessage('configuration', configuration);\n  });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (sdk);\n\n\n//# sourceURL=webpack://nexusdk/./src/index.js?");

/***/ }),

/***/ "./src/objectUtility.js":
/*!******************************!*\
  !*** ./src/objectUtility.js ***!
  \******************************/
/*! exports provided: set, has, get, setKey, setWithSubkey, setKeyWithSubkey, getObjectPath, getStringPathForArray, assurePathExists */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"set\", function() { return set; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"has\", function() { return has; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"get\", function() { return get; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setKey\", function() { return setKey; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setWithSubkey\", function() { return setWithSubkey; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setKeyWithSubkey\", function() { return setKeyWithSubkey; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getObjectPath\", function() { return getObjectPath; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getStringPathForArray\", function() { return getStringPathForArray; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"assurePathExists\", function() { return assurePathExists; });\n/* eslint no-prototype-builtins: \"off\" */\nfunction set(object, path, value) {\n  let subObject = object;\n  const keys = getObjectPath(path || '');\n  for (let keydex = 0; keydex < keys.length; keydex += 1) {\n    let key = keys[keydex];\n    if (key !== '') {\n      if (key[key.length - 1] === ']') {\n        key = key.substr(0, key.length - 1);\n        key = parseInt(key, 10);\n      }\n      if (keydex !== keys.length - 1) {\n        if (typeof subObject[key] !== 'object') {\n          subObject[key] = {};\n        }\n        subObject = subObject[key];\n      } else {\n        subObject[key] = value;\n      }\n    }\n  }\n\n  return object;\n}\n\nfunction has(object, key) {\n  if (typeof object === 'object') {\n    return (object.hasOwnProperty(key));\n  }\n  return false;\n}\n\nfunction get(object, path, defaultValue = undefined) {\n  let subObject = object;\n  const keys = getObjectPath(path || '');\n  for (let keydex = 0; keydex < keys.length; keydex += 1) {\n    let key = keys[keydex];\n    if (key !== '') {\n      if (key[key.length - 1] === ']') {\n        key = key.substr(0, key.length - 1);\n        key = parseInt(key, 10);\n      }\n\n      if (!has(subObject, key)) return defaultValue;\n\n      subObject = subObject[key];\n    }\n  }\n\n  return subObject;\n}\n\nfunction setKey(object, path, key, value) {\n  if (path === null || path === undefined || path === '') {\n    path = key;\n  } else {\n    path += `.${key}`;\n  }\n  return set(object, path, value);\n}\n\nfunction setWithSubkey(object, path, subkey, value) {\n  let subObject = object;\n  (path || '').split('.').forEach((key, dex, ray) => {\n    if (key !== '' && dex !== ray.length - 1) {\n      if (subObject[subkey] === undefined) {\n        subObject[subkey] = { [key]: {  } };\n      }\n      subObject = subObject[subkey][key];\n    } else {\n      if (subObject[subkey] === undefined) {\n        subObject[subkey] = { [key]: {  } };\n      }\n      subObject[subkey][key] = value;\n    }\n  });\n\n  return object;\n}\n\nfunction setKeyWithSubkey(object, path, subkey, key, value) {\n  if (path === null || path === undefined || path === '') {\n    path = key;\n  } else {\n    path += `.${key}`;\n  }\n  return setWithSubkey(object, path, subkey, value);\n}\n\nfunction getObjectPath(path) {\n  if (path instanceof Array) return path;\n  let inBrackets = false;\n  let partBegin = 0;\n  let split = false;\n  let exitBrackets = false;\n  const pathlen = path.length;\n  const parts = [];\n\n  for(let dex = 0; dex < pathlen + 1; dex += 1) {\n    const char = path[dex];\n    if (inBrackets && !exitBrackets) {\n      if (char === ']') {\n        exitBrackets = true;\n      }\n    } else if (char === '.') {\n      split = true;\n    } else if (char === '[') {\n      split = true;\n      inBrackets = true;\n    }\n\n    if (split || dex === pathlen) {\n      let nextPart = path.substr(partBegin, dex - partBegin - (exitBrackets ? 1 : 0))\n      if (inBrackets) {\n        const parsed = parseInt(nextPart, 10);\n        if (!isNaN(parsed)) {\n          nextPart = parsed;\n        }\n      }\n      parts.push(nextPart);\n      partBegin = dex + 1;\n      split = false;\n      if (exitBrackets) inBrackets = false;\n      exitBrackets = false;\n    }\n  }\n  return parts;\n}\n\nfunction getStringPathForArray(arrayPath) {\n  return arrayPath.reduce((result, item, dex) => {\n    if (toString.call(item) === '[object Number]') {\n      return `${result}[${item}]`;\n    }\n    return result + (dex > 0 ? '.': '') + item;\n  }, '');\n}\n\nfunction assurePathExists(object, path, defaultValue = {}) {\n  const arrayPath = getObjectPath(path);\n  let currentObject = object;\n  for (let arraydex = 0; arraydex < arrayPath.length; arraydex += 1) {\n    const key = arrayPath[arraydex];\n    if (!has(currentObject, key)) { // TODO: Address problems where key exists already and is not an array or object\n      const nextKey = ((arraydex === arrayPath.length - 1) ? null : arrayPath[arraydex + 1]);\n      if (nextKey === null) {\n        currentObject[key] = defaultValue;\n      } else if (toString.call(nextKey) === '[object Number]') {\n        currentObject[key] = [];\n      } else {\n        currentObject[key] = {};\n      }\n    }\n    currentObject = currentObject[key];\n  }\n  return currentObject;\n}\n\n\n//# sourceURL=webpack://nexusdk/./src/objectUtility.js?");

/***/ })

/******/ });
});