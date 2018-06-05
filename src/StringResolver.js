// Build User: ${build.user}
// Version: ${build.version}
// Build Date: ${build.date}

// TODO: es6
// TODO: jsdoc

// TODO: FEATURE: Allow pass in options during resolve()
// TODO: FEATURE: Allow escape (figure out in the regular expression?)

// TODO: FEATURE: Option: Check for balance - this is hard, maybe impossible; if a resolver resolves part of a resolver
//         a: ${some_resolver_prefix_
//         b: rest_of_resolver}
//         c: some_resolver_prefix_rest_of_resolver
//         After resolving just a, there will be unbalanced resolvers; but only for one loop


(function(root, factory) {
    'use strict';

    // Determine the module system (if any)
    if ('function' === typeof define && !!define.amd) {
        // AMD
        define('StringResolver', ['./CommonUtil.js'], factory);
    } else {
        // Node
        if ('object' === typeof exports) {
            module.exports = factory(require('./CommonUtil'));
        } else {
            // None
            root.StringResolver = factory(root.CommonUtil);
        }
    }

})(this, function(CommonUtil) {
    'use strict';

    var StringResolver = function StringResolver(defaultResolverMap, options) {

        if (!(this instanceof StringResolver)) {
            return new StringResolver(defaultResolverMap, options);
        }

        var identityResolver = function identityResolver(key) {
            return '${' + key + '}';
        },
        _defaultResolverMap = CommonUtil.normalizeResolverDefinitions(defaultResolverMap),
        _options = CommonUtil.merge({
            nullReplacement: identityResolver,
            undefinedReplacement: identityResolver
        }, options),
        normalizeValue = function normalizeValue(value, pattern) {
            if ('function' === typeof value) {
                return normalizeValue(value(pattern));
            } else {
                return value;
            }
        },
        getRegex = function getRegex(pattern) {
            return new RegExp('\\${' + pattern + '}', 'gi');
        },
        processLoop = function processLoop(template, resolverMap) {
            var processedTemplateString = template;

            CommonUtil.forEach(resolverMap, function(resolver/*, index*/) {

                var regex = getRegex(resolver.pattern),
                    replacement;

                // We allow functions for the replacement!
                if ('function' === typeof resolver.replacement) {
                    replacement = resolver.replacement(resolver.pattern, template, processedTemplateString);
                } else {
                    replacement = resolver.replacement;
                }

                // Only replace if the replacement is defined
                if (undefined === replacement) {
                    // console.log(
                    //     'replacement is null',
                    //     'resolver.pattern', resolver.pattern,
                    //     '_options.undefinedReplacement', _options.undefinedReplacement,
                    //     'normalizeValue(_options.undefinedReplacement, resolver.pattern)', normalizeValue(_options.undefinedReplacement, resolver.pattern)
                    // );
                    processedTemplateString = processedTemplateString.replace(regex, normalizeValue(_options.undefinedReplacement, resolver.pattern));
                } else if (null === replacement) {
                    processedTemplateString = processedTemplateString.replace(regex, normalizeValue(_options.nullReplacement, resolver.pattern));
                } else {
                    processedTemplateString = processedTemplateString.replace(regex, replacement);
                }
            });

            return processedTemplateString;
        },
        resolve = function resolve(template, resolverMap) {
            var processedTemplateString = template,
            processedLoopResult,
            _resolverMap = [];

            // Return the empty string if the template is not defined
            if (!CommonUtil.isDefined(template)) {
                return template;
            }

            // Populate the default resolvers
            if (_defaultResolverMap) {
                CommonUtil.forEach(_defaultResolverMap, function (resolver/*, index*/) {
                    _resolverMap.push(resolver);
                });
            }

            // Populate the resolver map
            if (!!resolverMap) {
                CommonUtil.forEach(CommonUtil.normalizeResolverDefinitions(resolverMap), function(resolver/*, index*/) {
                    _resolverMap.push(resolver);
                });
            }
            // Only process if there are resolvers!
            if (_resolverMap.length) {
                // Loop through until no more resolutions take place
                while (processedTemplateString !== (processedLoopResult = processLoop(processedTemplateString, _resolverMap))) {
                    processedTemplateString = processedLoopResult;
                }
            }

            return processedTemplateString;
        };

        return {
            resolve: resolve
        };

    };

    // Place the version as a member in the function
    StringResolver.version = '${build.version}';

    return StringResolver;
});
