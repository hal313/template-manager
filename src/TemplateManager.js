// Version: ${build.version}
// Build Date: ${build.date}
//
// TODO: Allow escape (this will have to be figured out in the regular expression)
// TODO: jsdoc
// TODO: .add() should take in an optional third argument (resolver map)

// TODO: Test require/define
// TODO: remove jquery
//
(function(root, factory) {
    'use strict';

    (function(){
        if (!window.console) {
            window.console = {};
        }
        // Union of Chrome, FF, IE, and Safari console methods
        var consoleFunctions = [
            'log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'group',
            'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd',
            'dirxml', 'assert', 'count', 'markTimeline', 'timeStamp', 'clear'
        ];
        // Define undefined methods as no-ops to prevent errors
        for (var i = 0; i < consoleFunctions.length; i++) {
            if (!window.console[consoleFunctions[i]]) {
                window.console[consoleFunctions[i]] = function() {};
            }
        }
    })();

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        if (typeof exports !== 'undefined') {
            module.exports = factory();
        } else {
            root.TemplateManager = factory();
        }
    }

})(this, function() {
    'use strict';

    // This is a regex cache for all of the instances of TemplateManager (like a private static member)
    var _getRegex = function(regex) {
        // Memoize the cache
        if (!_getRegex.cache) {
            _getRegex.cache = {};
        }

        if (!_getRegex.cache[regex]) {
            _getRegex.cache[regex] = new RegExp(regex, 'gi');
        }

        return _getRegex.cache[regex];
    };

    var TemplateManager = function(defaultResolverMap, options) {

        if (!(this instanceof TemplateManager)) {
            return new TemplateManager(defaultResolverMap, options);
        }

        var _options = $.extend({
            scriptType: 'text/x-template-manager'
        }, options);

        // The template cache
        var _templateCache = [];

        // Flag to determine if the templates have been loaded from the HTML page
        var _hasLoaded = false;


        var _find = function(name) {
            return _templateCache[name];
        };

        var _addToCache = function(name, template) {
            if (name) {
                _templateCache[name] = template;
            }
        };

        var _add = function(name, template) {
            _addToCache(name, template);
            return _get(name);
        };

        var _load = function() {
            // Get all the scripts
            var $scripts = jQuery('script');

            // Add each template into the cache
            $scripts.each(function(index, script) {
                var $script;
                var name;
                var content;

                // Check to see if the script type matches the type desired
                if (_options.scriptType === script.type) {
                    $script = jQuery(script);
                    name = $script.data('name').trim();
                    content = script.innerHTML.trim();

                    if (name.length) {
                        // Add to the cache
                        _addToCache(name, content);
                    } else {
                        // Output warning (no name)
                        console.warn('Template has no name');
                    }
                }
            });

            _hasLoaded = true;
        };


        var _remove = function(name) {
            delete _templateCache[name];
        };

        var _raw = function(templateName, template) {
            return template || '';
        };

        var _processLoop = function(template, resolverMap) {
            var processedTemplateString = template;

            jQuery.each(resolverMap, function(index, resolver) {
                var regex = _getRegex('\\${' + resolver.regex + '}');
                var replacement;

                // We allow functions for the replacement!
                if (jQuery.isFunction(resolver.replacement)) {
                    try {
                        replacement = resolver.replacement(resolver.regex, template, processedTemplateString);
                    } catch(error) {
                        console.error('Error while calculating replacement for', resolver.regex, error);
                    }
                } else {
                    replacement = resolver.replacement;
                }

                // Only replace if the replacement is defined
                if (replacement) {
                    processedTemplateString = processedTemplateString.replace(regex, replacement);
                }
            });

            return processedTemplateString;
        };

        var _process = function(templateName, template, resolverMap) {
            var processedTemplateString = template;
            var processedLoopResult;

            var _resolverMap = [];

            // Return the empty string if the template is not defined
            if (!template) {
                return '';
            }

            // Populate the default resolvers
            if (defaultResolverMap && defaultResolverMap[templateName]) {
                jQuery.each(defaultResolverMap[templateName], function(index, resolver) {
                    _resolverMap.push(resolver);
                });
            }

            // Populate the resolver map
            if (resolverMap) {
                jQuery.each(resolverMap, function(index, resolver) {
                    _resolverMap.push(resolver);
                });
            }

            // Only process if there are resolvers!
            if (_resolverMap.length) {
                // Loop through until no more resolutions take place
                while (processedTemplateString !== (processedLoopResult = _processLoop(processedTemplateString, _resolverMap))) {
                    processedTemplateString = processedLoopResult;
                }
            }

            return processedTemplateString;
        };

        var _get = function(name) {
            var rawTemplate;

            if (!_hasLoaded) {
                _load();
            }

            // Get the template from the cache
            rawTemplate = _find(name);

            // If the template is not found in the cache, return null
            if (!rawTemplate) {
                console.error('Template \'%s\' does not exist', name);
            }
            return {
                process: function(resolverMap) {
                    return _process(name, rawTemplate, resolverMap);
                },
                raw: function() {
                    return _raw(name, rawTemplate);
                }
            };

        };

        return {
            load: _load,
            get: _get,
            add: _add,
            remove: _remove
        };

    };

    return TemplateManager;
});
