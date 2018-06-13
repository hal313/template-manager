(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.TemplateManager = {})));
}(this, (function (exports) { 'use strict';

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
  // [Common] Version:    1.1.7
  // [Common] Build Date: Tue Jun 12 2018 19:59:22 GMT-0400 (Eastern Daylight Time)

  var isResolverDefinition = function isResolverDefinition(definition) {
      return !!definition && definition.hasOwnProperty('pattern') && definition.hasOwnProperty('replacement');
  };

  var CommonUtil = function CommonUtil() {
      classCallCheck(this, CommonUtil);
  };

  CommonUtil.forEach = function (collection, callback) {
      if (Array.isArray(collection)) {
          collection.forEach(callback);
      } else {
          Object.getOwnPropertyNames(collection).forEach(function onItem(propertyName) {
              callback(collection[propertyName], propertyName);
          });
      }
  };

  CommonUtil.merge = function () {
      for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
          objects[_key] = arguments[_key];
      }

      var mergedObject = {};
      var sources = void 0;
      var source = void 0;

      if (!!objects) {
          sources = Array.prototype.slice.call(objects);

          for (var i = 0; i < sources.length; i++) {
              source = sources[i];
              if (!!source) {
                  for (var attributeName in source) {
                      mergedObject[attributeName] = source[attributeName];
                  }
              }
          }
      }

      return mergedObject;
  };

  CommonUtil.isDefined = function (value) {
      return undefined !== value && null !== value;
  };

  CommonUtil.isNil = function (value) {
      // Return true if:
      //  value is NOT defined
      //  OR value IS defined AND it is the empty string (when trimmed)
      return !CommonUtil.isDefined(value) || CommonUtil.isDefined(value) && '' === value.toString().trim();
  };

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
      return {
          pattern: pattern,
          replacement: replacement
      };
  };

  CommonUtil.normalizeResolverDefinition = function (definitionOrPattern, replacement) {
      if (isResolverDefinition(definitionOrPattern)) {
          // Duck type for 'classic' resolvers
          return CommonUtil.createResolverDefinition(definitionOrPattern.pattern, definitionOrPattern.replacement);
      } else {
          // Reverse the parameters (this is an object with key/value parings)
          return CommonUtil.createResolverDefinition(definitionOrPattern, replacement);
      }
  };

  CommonUtil.normalizeResolverDefinitions = function (definitions) {
      var resolverDefinitions = [];

      if (!!definitions) {
          CommonUtil.forEach(definitions, function (definitionOrReplacement, indexOrPattern) {
              if (isResolverDefinition(definitionOrReplacement)) {
                  resolverDefinitions.push(CommonUtil.normalizeResolverDefinition(definitionOrReplacement));
              } else {
                  resolverDefinitions.push(CommonUtil.normalizeResolverDefinition(indexOrPattern, definitionOrReplacement));
              }
          });
      }

      return resolverDefinitions;
  };

  // Burn in the version
  CommonUtil.version = '1.1.7';

  // [StringResolver] Build User: User

  var normalizeValue = function normalizeValue(value, pattern) {
      if ('function' === typeof value) {
          return normalizeValue(value(pattern));
      } else {
          return value;
      }
  };

  var getRegex = function getRegex(pattern) {
      return new RegExp('\\${' + pattern + '}', 'gi');
  };

  var processLoop = function processLoop(template, resolverMap, options) {
      var processedTemplateString = template;

      CommonUtil.forEach(resolverMap, function (resolver) {

          var regex = getRegex(resolver.pattern),
              replacement = void 0;

          // We allow functions for the replacement!
          if ('function' === typeof resolver.replacement) {
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

  var StringResolver = function StringResolver(defaultResolverMap, options) {
      classCallCheck(this, StringResolver);


      var _defaultResolverMap = CommonUtil.normalizeResolverDefinitions(defaultResolverMap);

      var _options = CommonUtil.merge({
          nullReplacement: StringResolver.identityResolver,
          undefinedReplacement: StringResolver.identityResolver
      }, options);

      this.resolve = function (template, resolverMap) {
          var processedTemplateString = template;
          var processedLoopResult = void 0;
          var internalResolverMap = [];

          // Return the empty string if the template is not defined
          if (!CommonUtil.isDefined(template)) {
              return template;
          }

          // Populate the default resolvers
          if (_defaultResolverMap) {
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
              while (processedTemplateString !== (processedLoopResult = processLoop(processedTemplateString, internalResolverMap, _options))) {
                  processedTemplateString = processedLoopResult;
              }
          }

          return processedTemplateString;
      };
  };

  StringResolver.identityResolver = function (key) {
      return '${' + key + '}';
  };

  // Burn in the version
  StringResolver.version = '1.1.7';

  // [TemplateManager] Build User: User

  var getAttribute = function getAttribute(element, name) {
      return element.getAttribute(element, name) || element.getAttribute('data-' + name);
  };

  var validateTemplateName = function validateTemplateName(name) {
      if (CommonUtil.isNil(name)) {
          throw new Error('Invalid template name: \'' + name + '\'/');
      }
      // For chaining!
      return name;
  };

  var rawTemplate = function rawTemplate(templateName, template) {
      return template;
  };

  var processTemplate = function processTemplate(template, resolverMap, defaultResolverMap) {
      var _resolverMap = [];

      if (defaultResolverMap) {
          CommonUtil.forEach(defaultResolverMap, function onResolver(resolver, index) {
              _resolverMap.push(CommonUtil.normalizeResolverDefinition(resolver, index));
          });
      }

      // Populate the resolver map
      if (resolverMap) {
          CommonUtil.forEach(resolverMap, function onResolver(resolver, index) {
              _resolverMap.push(CommonUtil.normalizeResolverDefinition(resolver, index));
          });
      }

      return new StringResolver().resolve(template, _resolverMap);
  };

  var TemplateManager = function TemplateManager(defaultResolverMap, options) {
      var _this = this;

      classCallCheck(this, TemplateManager);


      // The options
      var _options = CommonUtil.merge({ scriptType: 'text/x-template-manager' }, options);

      // The template cache
      var templateCache = {};

      var getTemplate = function getTemplate(name) {
          if (!_this.hasTemplate(validateTemplateName(name))) {
              throw new Error('Template \'' + name + '\' does not exist');
          }

          return templateCache[name];
      };

      var addTemplateToCache = function addTemplateToCache(name, template) {
          templateCache[validateTemplateName(name)] = template;
      };

      this.get = function (name) {
          // Get the template from the cache
          var template = getTemplate(validateTemplateName(name));

          return {
              process: function process(resolverMap) {
                  return processTemplate(template, resolverMap, defaultResolverMap);
              },
              raw: function raw() {
                  return rawTemplate(name, template);
              }
          };
      };

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

      this.load = function (root) {
          // Get all the script elements
          var scriptElements = (root || document).getElementsByTagName('script');

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

      this.remove = function (name) {
          delete templateCache[validateTemplateName(name)];
      };

      this.getTemplateNames = function () {
          var names = [];

          CommonUtil.forEach(templateCache, function (value, name) {
              names.push(name);
          });

          return names;
      };

      this.hasTemplate = function (name) {
          return CommonUtil.isDefined(templateCache[validateTemplateName(name)]);
      };

      this.empty = function () {
          templateCache = {};
      };
  };

  // Place the version as a member in the function
  TemplateManager.version = '1.1.7';

  // [Module] Build User: User

  exports.StringResolver = StringResolver;
  exports.TemplateManager = TemplateManager;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
