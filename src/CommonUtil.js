// [Common] Build User: ${build.user}
// [Common] Version:    ${build.version}
// [Common] Build Date: ${build.date}

/**
 * Determines if an object is likely a resolver definition. A resolver definition will have two properties:
 *   pattern - the string pattern
 *   replacement - the replacement value (function or object/string)
 *
 * @param {Object} definition Determines if a definition is likely a resolver definition.
 * @return {boolean} true if "definition" is a resolver definition.
 */
let isResolverDefinition = (definition) => {
    return !!definition && definition.hasOwnProperty('pattern') && definition.hasOwnProperty('replacement');
};

/**
 * Common utilities shared between all classes in this module.
 */
export class CommonUtil {

}

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
CommonUtil.forEach = (collection, callback) => {
    if (Array.isArray(collection)) {
        collection.forEach(callback);
    } else {
        Object.getOwnPropertyNames(collection).forEach(function onItem(propertyName) {
            callback(collection[propertyName], propertyName);
        });
    }
};

/**
 * Merges objects from right to left, where the left-most item takes precedence over the right-most item.
 *
 * @param {Object[]} objects
 * @return {Object} an object whose members are the result of merging all object parameters into this object
 */
CommonUtil.merge = (...objects) => {
    let mergedObject = {};
    let sources;
    let source;

    if (!!objects) {
        sources = Array.prototype.slice.call(objects);

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
};

/**
 * Utility function to check to see if a value is defined. Note that the number 0 is defined, as is the empty string.
 *
 * @param {*} value the value to test
 * @return true if the value is not null and not undefined
 */
CommonUtil.isDefined = (value) => {
    return undefined !== value && null !== value;
};

/**
 * Determines if a value is nil (null, undefined or the empty string).
 *
 * @param {*} value the value to test
 * @return true if the value is not defined OR the value is the empty string
 */
CommonUtil.isNil = (value) => {
    // Return true if:
    //  value is NOT defined
    //  OR value IS defined AND it is the empty string (when trimmed)
    return !CommonUtil.isDefined(value) || (CommonUtil.isDefined(value) && '' === value.toString().trim());
};

/**
 * Creates a valid resolver definition. A resolver defintion looks like:
 * {
 *   pattern: <string>,
 *   replacement: <string|() => string>
 * }
 *
 * @param {string} pattern the pattern to use for the resolver definition
 * @param {string|function} replacement a replacement for the resolver function
 * @return {Object} a resolver definition, which contains both a "pattern" as well as a "replacement" member
 */
CommonUtil.createResolverDefinition = (pattern, replacement) => {
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
};

/**
 * Normalizes a resolver definition.
 *
 * @param {Object|string} definitionOrPattern a resolver definition or a string
 * @param {string|function} replacement the replacement value (or function)
 * @return {Object} a resolver definition, which contains both a "pattern" as well as a "replacement" member
 */
CommonUtil.normalizeResolverDefinition = (definitionOrPattern, replacement) => {
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
CommonUtil.normalizeResolverDefinitions = (definitions) => {
    let resolverDefinitions = [];

    if (!!definitions) {
        CommonUtil.forEach(definitions, (definitionOrReplacement, indexOrPattern) => {
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
CommonUtil.version = '${build.version}';
