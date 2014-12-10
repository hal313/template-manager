// TODO: Use logger instead of console
// TODO: Allow escape
// TODO: ${} instead of {}
// TODO: jsdoc

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

    return function(defaultResolverMap) {

        // The template cache
        var _templateCache = [];

        // Flag to determine if the templates have been loaded from the HTML page
        var _hasLoaded = false;

        var _find = function(name) {
            return _templateCache[name];
        };

        var _doAdd = function(name, template) {
            if (name) {
                _templateCache[name] = template;
            }
        };

        var _add = function(name, template) {
            _doAdd(name, template);
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

                // Check to see if the script type is 'text/template'
                if ('text/template' === script.type) {
                    $script = jQuery(script);
                    name = $script.data('name').trim();
                    content = script.innerHTML.trim();

                    if (name.length) {
                        // Add to the cache
                        _add(name, content);
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

            // TODO: Remove the check for Only process if there are resolvers!
            if (resolverMap.length) {
                jQuery.each(resolverMap, function(index, resolver) {
                    // TODO: Regex caching?
                    var regex = new RegExp('\\${' + resolver.regex + '}', 'gi');
                    var replacement;

                    // We allow functions for the replacement!
                    if (jQuery.isFunction(resolver.replacement)) {
                        try {
                            replacement = resolver.replacement();
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
            }

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

            // TODO: Only process if there are resolvers!


            // Loop through until no more resolutions take place
            while (processedTemplateString !== (processedLoopResult = _processLoop(processedTemplateString, _resolverMap))) {
                processedTemplateString = processedLoopResult;
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

});
