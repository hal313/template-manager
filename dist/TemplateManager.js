(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('flat')) :
  typeof define === 'function' && define.amd ? define(['exports', 'flat'], factory) :
  (factory((global.TemplateManager = {}),global.flat));
}(this, (function (exports,flat) { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  // [Common] Build User: User
  // [Common] Version:    2.1.5
  // [Common] Build Date: Sat Jun 23 2018 10:22:07 GMT-0400 (Eastern Daylight Time)

  /**
   * Determines if an object is likely a resolver definition. A resolver definition will have two properties:
   *   pattern - the string pattern
   *   replacement - the replacement value (function or object/string)
   *
   * @param {Object} definition Determines if a definition is likely a resolver definition.
   * @return {boolean} true if "definition" is a resolver definition.
   */
  var isResolverDefinition = function isResolverDefinition(definition) {
      return !!definition && definition.hasOwnProperty('pattern') && definition.hasOwnProperty('replacement');
  };

  /**
   * Common utilities shared between all classes in this module.
   */
  var CommonUtil = function CommonUtil() {
      classCallCheck(this, CommonUtil);
  };

  /**
   * Iterates over a collection, invoking a callback for each item in the collection.
   *
   * CommonUtil.forEach([1, 2, 3], function (item, index) {});
   * // Or:
   * CommonUtil.forEach({someName: 'someValue'}, function (value, name) {});
   *
   * @param {Object|Array} collection A collection to iterate over
   * @param {function} callback the callback function for each item in the collection
   */
  CommonUtil.forEach = function (collection, callback) {
      if (Array.isArray(collection)) {
          collection.forEach(callback);
      } else {
          Object.getOwnPropertyNames(collection).forEach(function onItem(propertyName) {
              callback(collection[propertyName], propertyName);
          });
      }
  };

  /**
   * Flattens an object. The object will be one level deep, with each element separated
   * by periods. For example, flattening:
   *  {
   *      person: {
   *          firstName: 'Clark',
   *          lastName: 'Kent'
   *      }
   *  }
   *
   * Will produce:
   *  {
   *      person.firstName: 'Clark',
   *      person.lastName: 'Kent'
   *  }
   *
   * Arrays are specified with dot-numeric notation:
   *
   * {
   *      colors: ['red', 'green', 'blue']
   * }
   *
   * Will produce:
   * {
   *      colors.0: 'red',
   *      colors.1: 'green',
   *      colors.2: 'blue'
   * }
   *
   * This is useful for using resolvers with embedded objects.
   *
   * @param {Object} map the map to flatten
   * @returns {Object} the flattened object
   */
  CommonUtil.flattenMap = function (map) {
      // Strinify/parse the map to remove functions
      return flat.flatten(JSON.parse(JSON.stringify(map)));
  };

  /**
   * Merges objects from right to left, where the left-most item takes precedence over the right-most item.
   *
   * @param {Object[]} objects
   * @return {Object} an object whose members are the result of merging all object parameters into this object
   */
  CommonUtil.merge = function () {
      for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
          objects[_key] = arguments[_key];
      }

      var mergedObject = {};
      var sources = Array.prototype.slice.call(objects);
      var source = void 0;

      for (var i = 0; i < sources.length; i++) {
          source = sources[i];
          if (!!source) {
              for (var attributeName in source) {
                  mergedObject[attributeName] = source[attributeName];
              }
          }
      }

      return mergedObject;
  };

  /**
   * Utility function to check to see if a value is defined. Note that the number 0 is defined, as is the empty string.
   *
   * @param {*} value the value to test
   * @return true if the value is not null and not undefined
   */
  CommonUtil.isDefined = function (value) {
      return undefined !== value && null !== value;
  };

  /**
   * Determines if a value is nil (null, undefined or the empty string).
   *
   * @param {*} value the value to test
   * @return true if the value is not defined OR the value is the empty string
   */
  CommonUtil.isNil = function (value) {
      // Return true if:
      //  value is NOT defined
      //  OR value IS defined AND it is the empty string (when trimmed)
      return !CommonUtil.isDefined(value) || CommonUtil.isDefined(value) && '' === value.toString().trim();
  };

  /**
   * Checks to see if a value is a function.
   *
   * @param {*} value the value to check to see if it is a function
   * @returns {boolean} true, if the value is a function; false otherwise
   */
  CommonUtil.isFunction = function (value) {
      return 'function' === typeof value;
  };

  /**
   * Checks to see if a value is an array.
   *
   * @param {*} value the value to check to see if it is an array
   * @returns {boolean} true, if the value is an array; false otherwise
   */
  CommonUtil.isArray = function (value) {
      return Array.isArray(value);
  };

  /**
   * Checks to see if a value is an object (not an array).
   *
   * @param {*} value the value to check to see if it is an object
   * @returns {boolean} true, if the value is an object; false otherwise
   */
  CommonUtil.isObject = function (value) {
      return CommonUtil.isDefined(value) && !CommonUtil.isArray(value) && 'object' === (typeof value === 'undefined' ? 'undefined' : _typeof(value));
  };

  /**
   * Creates a valid resolver definition. A resolver defintion looks like:
   * {
   *   pattern: <string>,
   *   replacement: <string|() => string>
   * }
   *
   * @param {string} pattern the pattern to use for the resolver definition
   * @param {string|function|object} replacement a replacement for the resolver function
   * @return {Object[]} an array of resolver definitions, which each contain both a "pattern" as well as a "replacement" member
   */
  CommonUtil.createResolverDefinition = function (pattern, replacement) {
      if ('string' !== typeof pattern) {
          // If a classic definition is used but is incorrectly specified, this is what happens:
          // resolve(template, [{pattern: 'somePattern', replacement_spelled_wrong: 'someValue'}]);
          // Since normalizeResolverDefinition will NOT view the element as a definition, then
          // createResolverDefinition will be called with:
          //   0, { pattern: 'someResolver', replacement_spelled_wrong: undefined }
          // Clearly this is not intended!
          //
          // This could be avoided by easing up the check is isResolverDefinition to only check "pattern"
          //   return !!definition && definition.hasOwnProperty('pattern');
          //
          throw new Error('\'pattern\' must be a string, not \'' + (typeof pattern === 'undefined' ? 'undefined' : _typeof(pattern)) + '\' (\'' + pattern + '\'); this error may occur if using an incomplete classic resolver definition - be sure all classic resolver definitions have both a \'pattern\' and \'replacement\'.');
      }

      if (CommonUtil.isArray(replacement) || CommonUtil.isObject(replacement)) {
          var results = [];
          var map = {};
          map[pattern] = replacement;

          CommonUtil.forEach(CommonUtil.flattenMap(map), function (value, name) {
              results.push({
                  pattern: name,
                  replacement: value
              });
          });

          return results;
      } else {
          return [{
              pattern: pattern,
              replacement: replacement
          }];
      }
  };

  /**
   * Normalizes a resolver definition.
   *
   * @param {Object|string} definitionOrPattern a resolver definition or a string
   * @param {string|function} replacement the replacement value (or function)
   * @return {Object[]} an array of resolver definitions, which each contain both a "pattern" as well as a "replacement" member
   */
  CommonUtil.normalizeResolverDefinition = function (definitionOrPattern, replacement) {
      if (isResolverDefinition(definitionOrPattern)) {
          // Duck type for 'classic' resolvers
          return CommonUtil.createResolverDefinition(definitionOrPattern.pattern, definitionOrPattern.replacement);
      } else {
          // Reverse the parameters (this is an object with key/value parings)
          return CommonUtil.createResolverDefinition(definitionOrPattern, replacement);
      }
  };

  /**
   * Normalizes a collection of resolver definitions.
   *
   * @param {Object[]} definitions a collection of resolver definitions
   * @return {Object[]} an array of normalized resolver definitions
   */
  CommonUtil.normalizeResolverDefinitions = function (definitions) {
      var resolverDefinitions = [];

      if (!!definitions) {
          CommonUtil.forEach(definitions, function (definitionOrReplacement, indexOrPattern) {
              if (isResolverDefinition(definitionOrReplacement)) {
                  resolverDefinitions = resolverDefinitions.concat(CommonUtil.normalizeResolverDefinition(definitionOrReplacement, undefined));
              } else {
                  resolverDefinitions = resolverDefinitions.concat(CommonUtil.normalizeResolverDefinition(indexOrPattern, definitionOrReplacement));
              }
          });
      }

      return resolverDefinitions;
  };

  // Burn in the version
  CommonUtil.version = '2.1.5';

  // [StringResolver] Build User: User

  /**
   * Normalizes a value. If the value is a function, execute the function and return the value. Otherwise, return the value.
   *
   * If "value" is a function, it will be executed recursively until a non-function is returned. The "value" function will be passed
   * the "pattern" value during execution.
   *
   * @param {Function|string} value the value to normalize
   * @param {string} pattern the pattern to resolve to
   * @return {string} a resolved value
   */
  var normalizeValue = function normalizeValue(value, pattern) {
      if (CommonUtil.isFunction(value)) {
          return normalizeValue(value(pattern));
      } else {
          return value;
      }
  };

  /**
   * Gets a RegExp suitable for replacing in a template. The RegExp will be: ${pattern}
   *
   * @param {string} pattern the pattern to get the RegExp for
   * @return {RegExp} a regular expression object that replaces "${pattern}"
   */
  var getRegex = function getRegex(pattern) {
      return new RegExp('\\${' + pattern + '}', 'gi');
  };

  /**
   * Process a template with resolvers.
   *
   * @param {string} template the template to resolve
   * @param {Object} resolverMap the resolver map
   * @param {Object} options options to use during resolution
   * @return {string} a string whose resolvers has been resolved based on the resolved map
   */
  var resolveTemplate = function resolveTemplate(template, resolverMap, options) {
      var processedTemplateString = template;

      CommonUtil.forEach(resolverMap, function (resolver) {

          var regex = getRegex(resolver.pattern),
              replacement = void 0;

          // We allow functions for the replacement!
          if (CommonUtil.isFunction(resolver.replacement)) {
              replacement = resolver.replacement(resolver.pattern, template, processedTemplateString);
          } else {
              replacement = resolver.replacement;
          }

          // Only replace if the replacement is defined
          if (undefined === replacement) {
              processedTemplateString = processedTemplateString.replace(regex, normalizeValue(options.undefinedReplacement, resolver.pattern));
          } else if (null === replacement) {
              processedTemplateString = processedTemplateString.replace(regex, normalizeValue(options.nullReplacement, resolver.pattern));
          } else {
              processedTemplateString = processedTemplateString.replace(regex, replacement);
          }
      });

      return processedTemplateString;
  };

  /**
   * A class which resolves a string template with a map of values and/or functions. A template is a string
   * with ${} resolvers:
   *   "this is a ${unresolved} string"
   *
   * A ResolverMap is an object with key/value pairs which produce values for a resolver with the matching name:
   *   {
   *     unresolved: "resolved"
   *   }
   *
   * When resolve(template, resolverMap) is invoked, the return value will be:
   *   "this is a resolved string"
   *
   * ResolverMap values may be functions which produce either strings or other functions; the function chain
   * will be invoked until a string is produced.
   *
   * Embedded resolutions are allowed:
   *   "this is ${em${inner}ded}"
   *   {
   *     inner: "bed",
   *     embedded: "embeded value"
   *   }
   * The first resolution will produce:
   *   "this is ${embedded}"
   * And the second resolution will produce:
   *   "this is embedded value"
   *
   * Complex resolutions are possible, too:
   *   "this is ${${open}${middle}${close}}"
   *   {
   *     open: "${",
   *     middle: "inner",
   *     close: "}",
   *     inner: "a complex resolver"
   *   }
   * Productions:
   *   "this is ${${inner}}" => "this is a complex resolver"
   */
  var StringResolver =

  /**
   * Constructor for the StringResolver.
   *
   * @param {Object} defaultResolverMap the default resolver map, can be undefined
   * @param {Object} [options] Optional options for resolving
   */
  function StringResolver(defaultResolverMap, options) {
      classCallCheck(this, StringResolver);


      // The normalized resolver map
      var _defaultResolverMap = CommonUtil.normalizeResolverDefinitions(defaultResolverMap);

      var _options = CommonUtil.merge({
          nullReplacement: StringResolver.identityResolver,
          undefinedReplacement: StringResolver.identityResolver
      }, options);

      /**
       * Resolves a template with a resolver map.
       *
       * @param {string} template the template to resolve
       * @param {Object} resolverMap the resolver map
       * @return {string} the resolved template
       */
      this.resolve = function (template, resolverMap) {
          var processedTemplateString = template;
          var processedLoopResult = void 0;
          var internalResolverMap = [];

          // Return the empty string if the template is not defined
          if (!CommonUtil.isDefined(template)) {
              return template;
          }

          // Populate the default resolvers
          if (!!_defaultResolverMap.length) {
              CommonUtil.forEach(_defaultResolverMap, function (resolver) {
                  internalResolverMap.push(resolver);
              });
          }

          // Populate the resolver map
          if (!!resolverMap) {
              CommonUtil.forEach(CommonUtil.normalizeResolverDefinitions(resolverMap), function (resolver) {
                  internalResolverMap.push(resolver);
              });
          }
          // Only process if there are resolvers!
          if (internalResolverMap.length) {
              // Loop through until no more resolutions take place
              while (processedTemplateString !== (processedLoopResult = resolveTemplate(processedTemplateString, internalResolverMap, _options))) {
                  processedTemplateString = processedLoopResult;
              }
          }

          return processedTemplateString;
      };
  };

  /**
   * The identity resolver returns a resolver version of the passed in value. This is useful to produce resolutions
   * which represent the original input.
   *
   * @param {string} key the value to return
   * @return {string} ${<key>}
   */
  StringResolver.identityResolver = function (key) {
      return '${' + key + '}';
  };

  // Burn in the version
  StringResolver.version = '2.1.5';

  // [TemplateManager] Build User: User

  /**
   * Gets an attribute value from an element.
   *
   * @param {Element} element the element to get the attribute from
   * @param {string} name the name of the attribute; it is not necessary to prefix "data-" on the attribute
   * @return {string} the value for the attribute
   */
  var getAttribute = function getAttribute(element, name) {
      return element.getAttribute(name) || element.getAttribute('data-' + name);
  };

  /**
   * Validates a template name, throwing an Error if the template name is not valid. Valid template names
   * must not be null, undefined or the empty string.
   *
   * @param {string} name the template name to validate
   * @return the passed in name
   * @throws {Error} if the template name is invalid (null, undefined, '')
   */
  var validateTemplateName = function validateTemplateName(name) {
      if (CommonUtil.isNil(name)) {
          throw new Error('Invalid template name: \'' + name + '\'/');
      }
      // For chaining!
      return name;
  };

  /**
   * A class to manage templates. Templates can be managed by code via add/get/remove. Further, templates specified
   * in the DOM may be imported via the load() function. A template can be specified in the DOM like so:
   *
   * <script type="text/x-template-manager" data-name="someTemplate">
   *   This is a template with ${resolvers}
   * </script>
   *
   * Template objects (returned from get()) look like:
   * {
   *   raw: () => string, // Returns the original template
   *   process: (resolverMap) => string // Resolves the template
   * }
   *
   */
  var TemplateManager =

  /**
   * Constructor for the TemplateManager.
   *
   * Options:
   * {
   *   // The type attribute for scripts to load from the DOM
   *   scriptType: 'text/x-template-manager'
   * }
   *
   * @param {Object} [defaultResolverMap] the default resolver map to use with all templates
   * @param {Object} [options] options for the TemplateManager instance
   */
  function TemplateManager(defaultResolverMap, options) {
      var _this = this;

      classCallCheck(this, TemplateManager);


      // The options
      var _options = CommonUtil.merge({ scriptType: 'text/x-template-manager' }, options);

      // The template cache
      var templateCache = {};

      /**
       *
       * @param {string} name Gets a template by name.
       * @return {string} the template
       */
      var getTemplate = function getTemplate(name) {
          if (!_this.hasTemplate(validateTemplateName(name))) {
              throw new Error('Template \'' + name + '\' does not exist');
          }

          return templateCache[name];
      };

      /**
       * Adds a template into the cache.
       *
       * @param {string} name the template name
       * @param {string} template the template
       */
      var addTemplateToCache = function addTemplateToCache(name, template) {
          templateCache[validateTemplateName(name)] = template;
      };

      /**
       * Gets a template object with "raw" and "process" functions.
       *
       * @param {string} name the name of the template to get
       * @return {Object} a template object.
       */
      this.get = function (name) {
          // Get the template from the cache
          var template = getTemplate(validateTemplateName(name));

          return {
              /**
               * Processes a template.
               *
               * @param {Object} resolverMap the resolver map
               * @return {string} a processed template
               */
              process: function process(resolverMap) {
                  var _resolverMap = [];

                  if (defaultResolverMap) {
                      CommonUtil.forEach(defaultResolverMap, function onResolver(resolver, index) {
                          _resolverMap = _resolverMap.concat(CommonUtil.normalizeResolverDefinition(resolver, index));
                      });
                  }

                  // Populate the resolver map
                  if (resolverMap) {
                      CommonUtil.forEach(resolverMap, function onResolver(resolver, index) {
                          _resolverMap = _resolverMap.concat(CommonUtil.normalizeResolverDefinition(resolver, index));
                      });
                  }
                  return new StringResolver().resolve(template, _resolverMap);
              },
              /**
               * Returns the raw template.
               *
               * @return {string} the template
               */
              raw: function raw() {
                  return template;
              }
          };
      };

      /**
       * Adds a template to the TemplateManager
       *
       * @param {string} name the template name
       * @param {string} template the template
       * @throws {Error} if the template name is not valid, the template name exists or template is not defined
       */
      this.add = function (name, template) {
          var templateName = validateTemplateName(name);

          if (_this.hasTemplate(templateName)) {
              throw new Error('Duplicate template name \'' + name + '\'');
          }

          if (!CommonUtil.isDefined(template)) {
              throw new Error('Template must be defined');
          }

          addTemplateToCache(templateName, template);
          return _this.get(templateName);
      };

      /**
       * Loads templates from the DOM into the TemplateManager.
       *
       * @param {Element} [rootElement] the element to load from
       */
      this.load = function (rootElement) {
          // Get all the script elements
          var scriptElements = (rootElement || document).getElementsByTagName('script');

          // Add each template into the cache
          CommonUtil.forEach(scriptElements, function (scriptElement, index) {
              var name = void 0,
                  content = void 0;

              // Check to see if the script type matches the type desired
              if (_options.scriptType === scriptElement.type) {
                  // Get the name
                  name = getAttribute(scriptElement, 'name');
                  // Get the content
                  content = scriptElement.innerHTML.trim();

                  validateTemplateName(name);
                  // Add to the cache
                  addTemplateToCache(name, content);
              }
          });
      };

      /**
       * Removes a template from the TemplateManager.
       *
       * @param {string} name the template name to remove
       */
      this.remove = function (name) {
          delete templateCache[validateTemplateName(name)];
      };

      /**
       * Gets an array of template names.
       *
       * @returns {string[]} an array of template names managed by this TemplateManager
       */
      this.getTemplateNames = function () {
          var names = [];

          CommonUtil.forEach(templateCache, function (value, name) {
              names.push(name);
          });

          return names;
      };

      /**
       * Determines if this TemplateManager instance manages a template with the specifed name.
       *
       * @param {string} name determines if this TemplateManager instance has a specified template
       * @returns {boolean} true, if this TemplateManager instance has a template with the specified name; false otherwise
       */
      this.hasTemplate = function (name) {
          return CommonUtil.isDefined(templateCache[validateTemplateName(name)]);
      };

      /**
       * Empties this TemplateManager instance.
       */
      this.empty = function () {
          templateCache = {};
      };
  };

  // Place the version as a member in the function
  TemplateManager.version = '2.1.5';

  // [Module] Build User: User

  exports.StringResolver = StringResolver;
  exports.TemplateManager = TemplateManager;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
