// [StringResolver] Build User: ${build.user}
// [StringResolver] Version:    ${build.version}
// [StringResolver] Build Date: ${build.date}

import { CommonUtil } from './CommonUtil';

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
let normalizeValue = (value, pattern) => {
    if ('function' === typeof value) {
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
let getRegex = (pattern) => {
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
let resolveTemplate = (template, resolverMap, options) => {
    let processedTemplateString = template;

    CommonUtil.forEach(resolverMap, (resolver) => {

        let regex = getRegex(resolver.pattern),
            replacement;

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
export class StringResolver {

    /**
     * Constructor for the StringResolver.
     *
     * @param {Object} defaultResolverMap the default resolver map, can be undefined
     * @param {Object} [options] Optional options for resolving
     */
    constructor(defaultResolverMap, options) {

        // The normalized resolver map
        let _defaultResolverMap = CommonUtil.normalizeResolverDefinitions(defaultResolverMap);

        let _options = CommonUtil.merge({
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
        this.resolve = (template, resolverMap) => {
            let processedTemplateString = template;
            let processedLoopResult;
            let internalResolverMap = [];

            // Return the empty string if the template is not defined
            if (!CommonUtil.isDefined(template)) {
                return template;
            }

            // Populate the default resolvers
            if (_defaultResolverMap) {
                CommonUtil.forEach(_defaultResolverMap, (resolver) => {
                    internalResolverMap.push(resolver);
                });
            }

            // Populate the resolver map
            if (!!resolverMap) {
                CommonUtil.forEach(CommonUtil.normalizeResolverDefinitions(resolverMap), (resolver) => {
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

    }

}

/**
 * The identity resolver returns a resolver version of the passed in value. This is useful to produce resolutions
 * which represent the original input.
 *
 * @param {string} key the value to return
 * @return {string} ${<key>}
 */
StringResolver.identityResolver = (key) => {
    return '${' + key + '}';
};

// Burn in the version
StringResolver.version = '${build.version}';
