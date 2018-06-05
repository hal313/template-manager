// Build User: ${build.user}
// Version: ${build.version}
// Build Date: ${build.date}

// TODO: es6
// TODO: jsdoc

// TODO: FEATURE: Allow escape (this will have to be figured out in the regular expression)
// TODO: FEATURE: Support nameless/anon scripts in load (supply fake name?)?
// TODO: FEATURE: Support named resolver maps (<script ...name="..." resolver="...")
// TODO: FEATURE: .add() should take in an optional third argument (resolver map)

(function(root, factory) {
    'use strict';

    // Determine the module system (if any)
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('TemplateManager', ['./CommonUtil.js', './StringResolver.js'], factory);
    } else {
        // Node
        if (typeof exports !== 'undefined') {
            module.exports = factory(require('./CommonUtil'), require('./StringResolver'));
        } else {
            // None
            root.TemplateManager = factory(root.CommonUtil, root.StringResolver);
        }
    }

})(this, function (CommonUtil, StringResolver) {
    'use strict';

    var getAttribute = function getAttribute(element, name) {
        return element.getAttribute(element, name) || element.getAttribute('data-' + name);
    },

    TemplateManager = function(defaultResolverMap, options) {

        if (!(this instanceof TemplateManager)) {
            return new TemplateManager(defaultResolverMap, options);
        }

        var _options = CommonUtil.merge({scriptType: 'text/x-template-manager'}, options),
            // The template cache
            templateCache = {},
            validateTemplateName = function validateTemplateName(name) {
                if (CommonUtil.isNil(name)) {
                    throw new Error('Invalid template name: \'' + name + '\'/');
                }
                // For chaining!
                return name;
            },
            hasTemplate = function hasTemplate(name) {
                return CommonUtil.isDefined(templateCache[validateTemplateName(name)]);
            },
            getTemplate = function getTemplate(name) {
                if (!hasTemplate(validateTemplateName(name))) {
                    throw new Error('Template \'' + name + '\' does not exist');
                }

                return templateCache[name];
            },
            addTemplateToCache = function(name, template) {
                templateCache[validateTemplateName(name)] = template;
            },
            rawTemplate = function rawTemplate(templateName, template) {
                return template;
            },
            processTemplate = function processTemplate(template, resolverMap) {
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
            },
            get = function get(name) {
                // Get the template from the cache
                var template = getTemplate(validateTemplateName(name));

                return {
                    process: function process(resolverMap) {
                        return processTemplate(template, resolverMap);
                    },
                    raw: function raw() {
                        return rawTemplate(name, template);
                    }
                };
            },
            add = function add(name, template) {
                var templateName = validateTemplateName(name);

                if (hasTemplate(templateName)) {
                    throw new Error('Duplicate template name \'' + name + '\'');
                }

                if (!CommonUtil.isDefined(template)) {
                    throw new Error('Template must be defined');
                }

                addTemplateToCache(templateName, template);
                return get(templateName);
            },
            load = function load() {
                // Get all the script elements
                var scriptElements = document.getElementsByTagName('script');

                // Add each template into the cache
                CommonUtil.forEach(scriptElements, function (scriptElement, index) {
                    var name,
                        content;

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
            },
            remove = function remove(name) {
                delete templateCache[validateTemplateName(name)];
            },
            getTemplateNames = function getTemplateNames() {
                var names = [];

                CommonUtil.forEach(templateCache, function (value, name) {
                    names.push(name);
                });

                return names;
            },
            empty = function empty() {
                templateCache = {};
            };

        return {
            load: load,
            get: get,
            add: add,
            remove: remove,
            getTemplateNames: getTemplateNames,
            hasTemplate: hasTemplate,
            empty: empty
        };

    };

    // Place the version as a member in the function
    TemplateManager.version = '${build.version}';

    return TemplateManager;
});
