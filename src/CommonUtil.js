// Build User: ${build.user}
// Version: ${build.version}
// Build Date: ${build.date}

// TODO: es6
// TODO: jsdoc

(function(root, factory) {
    'use strict';

    // Determine the module system (if any)
    if ('function' === typeof define && !!define.amd) {
        // AMD
        define('CommonUtil', [], factory);
    } else {
        // Node
        if ('object' === typeof exports) {
            module.exports = factory();
        } else {
            // None
            root.CommonUtil = factory();
        }
    }

})(this, function() {
    'use strict';

    var forEach = function forEach(collection, callback) {
        if (Array.isArray(collection)) {
            collection.forEach(callback);
        } else {
            Object.getOwnPropertyNames(collection).forEach(function onItem(propertyName) {
                callback(collection[propertyName], propertyName);
            });
        }
    },
    merge = function merge(objects){
        var mergedObject = {},
            sources,
            source;

        if (!!objects) {
            sources = Array.prototype.slice.call(arguments);

            for (var i=0; i<sources.length; i++) {
                source = sources[i];
                if (!!source) {
                    for (var attributeName in source) {
                        mergedObject[attributeName] = source[attributeName];
                    }
                }
            }
        }

        return mergedObject;
    },
    isDefined = function isDefined(value) {
        return undefined !== value && null !== value;
    },
    isNil = function isNil(value) {
        // Return true if:
        //  value is NOT defined
        //  OR value IS defined AND it is the empty string (when trimmed)
        return !isDefined(value) || (isDefined(value) && '' === value.toString().trim());
    },
    isResolverDefinition = function isResolverDefinition(definition) {
        return !!definition && definition.hasOwnProperty('pattern') && definition.hasOwnProperty('replacement');
    },
    createResolverDefinition = function createResolverDefinition(pattern, replacement) {
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
            throw new Error('\'pattern\' must be a string, not \'' + typeof pattern + '\' (\'' + pattern + '\'); this error may occur if using an incomplete classic resolver definition - be sure all classic resolver definitions have both a \'pattern\' and \'replacement\'.');
        }
        return {
            pattern: pattern,
            replacement: replacement
        };
    },
    normalizeResolverDefinition = function normalizeResolverDefinition(definitionOrPattern, replacement) {
        if (isResolverDefinition(definitionOrPattern)) {
            // Duck type for 'classic' resolvers
            return createResolverDefinition(definitionOrPattern.pattern, definitionOrPattern.replacement);
        } else {
            // Reverse the parameters (this is an object with key/value parings)
            return createResolverDefinition(definitionOrPattern, replacement);
        }
    },
    normalizeResolverDefinitions = function normalizeResolverDefinitions(definitions) {
        var resolverDefinitions = [];

        if (!!definitions) {
            forEach(definitions, function onDefinition(definitionOrReplacement, indexOrPattern) {
                if (isResolverDefinition(definitionOrReplacement)) {
                    resolverDefinitions.push(normalizeResolverDefinition(definitionOrReplacement));
                } else {
                    resolverDefinitions.push(normalizeResolverDefinition(indexOrPattern, definitionOrReplacement));
                }
            });
        }

        return resolverDefinitions;
    };

    // asResolverMap = function asResolverMap(pojo) {
    //     var resolverMap = [];
    //     if (!!pojo) {
    //         CommonUtil.forEach(Object.getOwnPropertyNames(pojo), function CommonUtil.forEach(index, name) {
    //             resolverMap.push(CommonUtil.createResolverDefinition(name, pojo[name]));
    //         });
    //     }
    //     return resolverMap;


    return {
        forEach: forEach,
        merge: merge,
        isDefined: isDefined,
        isNil: isNil,
        createResolverDefinition: createResolverDefinition,
        normalizeResolverDefinition: normalizeResolverDefinition,
        normalizeResolverDefinitions: normalizeResolverDefinitions
    };

});
