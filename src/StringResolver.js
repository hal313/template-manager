// Build User:  ${build.user}
// Version:     ${build.version}
// Build Date:  ${build.date}

// TODO: es6
// TODO: jsdoc

// TODO: FEATURE: Allow pass in options during resolve()
// TODO: FEATURE: Allow escape (figure out in the regular expression?)

// TODO: FEATURE: Option: Check for balance - this is hard, maybe impossible; if a resolver resolves part of a resolver
//         a: ${some_resolver_prefix_
//         b: rest_of_resolver}
//         c: some_resolver_prefix_rest_of_resolver
//         After resolving just a, there will be unbalanced resolvers; but only for one loop

import { CommonUtil } from './CommonUtil';

let normalizeValue = (value, pattern) => {
    if ('function' === typeof value) {
        return normalizeValue(value(pattern));
    } else {
        return value;
    }
};

let getRegex = (pattern) => {
    return new RegExp('\\${' + pattern + '}', 'gi');
};

let processLoop = (template, resolverMap, options) => {
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
export class StringResolver {


    constructor(defaultResolverMap, options) {

        this.defaultResolverMap = CommonUtil.normalizeResolverDefinitions(defaultResolverMap);

        this.options = CommonUtil.merge({
            nullReplacement: StringResolver.identityResolver,
            undefinedReplacement: StringResolver.identityResolver
        }, options);

    };

    resolve (template, resolverMap) {
        let processedTemplateString = template;
        let processedLoopResult;
        let internalResolverMap = [];

        // Return the empty string if the template is not defined
        if (!CommonUtil.isDefined(template)) {
            return template;
        }

        // Populate the default resolvers
        if (this.defaultResolverMap) {
            CommonUtil.forEach(this.defaultResolverMap, (resolver) => {
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
            while (processedTemplateString !== (processedLoopResult = processLoop(processedTemplateString, internalResolverMap, this.options))) {
                processedTemplateString = processedLoopResult;
            }
        }

        return processedTemplateString;
    };

};

StringResolver.identityResolver = (key) => {
    return '${' + key + '}';
};

// Burn in the version
StringResolver.version = '${build.version}';
