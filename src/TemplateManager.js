/*global jQuery:false */
/*global console:false */

// TODO: Make this a singleton
// TODO: Use logger instead of console
// TODO: Externs

var TemplateManager = function(defaultResolverMap) {
    'use strict';

    // Load the templates
    var _templateCache = [];

    var _hasLoaded = false;

    var _load = function() {
        // Get all the scripts
        var $scripts = jQuery('script');

        // Add each template into the cache
        $scripts.each(function(index, script) {
            var $script;
            var name;
            var content;

            // Check to see if the script tyoe is 'text/template'
            if ('text/template' === script.type) {
                $script = jQuery(script);
                name = $script.data('name').trim();
                content = script.innerHTML.trim();

                if (0 !== name.length) {
                    _templateCache[name] = content;
                } else {
                    // Output warning (no name)
                    console.warn('Template has no name');
                }
            }
        });

        _hasLoaded = true;
    };

    var _add = function(name, template) {
        _templateCache[name] = template;
    };

    var _remove = function(name) {
        delete _templateCache[name];
    };

    var _raw = function(templateName, template) {
        return template;
    };

    var _process = function(templateName, template, resolverMap) {
        var processedTemplateString = template;

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
        if (0 !== _resolverMap.length) {
            jQuery.each(_resolverMap, function(index, resolver) {
                // TODO: Regex caching?
                var regex = new RegExp('{' + resolver.regex + '}', 'gi');
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

    var _get = function(name) {
        var rawTemplate;

        if (!_hasLoaded) {
            _load();
        }

        // Get the template from the cache
        rawTemplate = _templateCache[name];

        // If the template is not found in the cache, return null
        if (!rawTemplate) {
            console.error('Template \'%s\' does not exist', name);
            rawTemplate = null;
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