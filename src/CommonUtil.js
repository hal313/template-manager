import {flatten, unflatten} from 'flat';

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
 * Flattens an object. The object will be one level deep, with each element separated
 * by periods. For example, flattening:
 *  {
 *      person: {
 *          firstName: 'Clark',
 *          lastName: 'Kent'
 *      }
 *  }
 *
 * Will produce:
 *  {
 *      person.firstName: 'Clark',
 *      person.lastName: 'Kent'
 *  }
 *
 * Arrays are specified with dot-numeric notation:
 *
 * {
 *      colors: ['red', 'green', 'blue']
 * }
 *
 * Will produce:
 * {
 *      colors.0: 'red',
 *      colors.1: 'green',
 *      colors.2: 'blue'
 * }
 *
 * This is useful for using resolvers with embedded objects.
 *
 * @param {Object} map the map to flatten
 * @returns {Object} the flattened object
 */
CommonUtil.flattenMap = (map) => {
    // Strinify/parse the map to remove functions
    return flatten(JSON.parse(JSON.stringify(map)));
};

/**
 * Merges objects from right to left, where the left-most item takes precedence over the right-most item.
 *
 * @param {Object[]} objects
 * @return {Object} an object whose members are the result of merging all object parameters into this object
 */
CommonUtil.merge = (...objects) => {
    let mergedObject = {};
    let sources = Array.prototype.slice.call(objects);
    let source;

    for (var i=0; i<sources.length; i++) {
        source = sources[i];
        if (!!source) {
            for (var attributeName in source) {
                mergedObject[attributeName] = source[attributeName];
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
 * Checks to see if a value is a function.
 *
 * @param {*} value the value to check to see if it is a function
 * @returns {boolean} true, if the value is a function; false otherwise
 */
CommonUtil.isFunction = (value) => {
    return 'function' === typeof value;
};

/**
 * Checks to see if a value is an array.
 *
 * @param {*} value the value to check to see if it is an array
 * @returns {boolean} true, if the value is an array; false otherwise
 */
CommonUtil.isArray = (value) => {
    return Array.isArray(value);
};

/**
 * Checks to see if a value is an object (not an array).
 *
 * @param {*} value the value to check to see if it is an object
 * @returns {boolean} true, if the value is an object; false otherwise
 */
CommonUtil.isObject = (value) => {
    return CommonUtil.isDefined(value) && !CommonUtil.isArray(value) && 'object' === typeof value;
};

/**
 * Creates a valid resolver definition. A resolver defintion looks like:
 * {
 *   pattern: <string>,
 *   replacement: <string|() => string>
 * }
 *
 * @param {string} pattern the pattern to use for the resolver definition
 * @param {string|function|object} replacement a replacement for the resolver function
 * @return {Object[]} an array of resolver definitions, which each contain both a "pattern" as well as a "replacement" member
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


    if (CommonUtil.isArray(replacement) || CommonUtil.isObject(replacement)) {
        let results = [];
        let map = {};
        map[pattern] = replacement;

        CommonUtil.forEach(CommonUtil.flattenMap(map), (value, name) => {
        results.push({
            pattern: name,
            replacement: value
        });
        });

        return results;
    } else {
        return [
            {
                pattern: pattern,
                replacement: replacement
            }
        ];
    }

};

/**
 * Normalizes a resolver definition.
 *
 * @param {Object|string} definitionOrPattern a resolver definition or a string
 * @param {string|function} replacement the replacement value (or function)
 * @return {Object[]} an array of resolver definitions, which each contain both a "pattern" as well as a "replacement" member
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
                resolverDefinitions = resolverDefinitions.concat(CommonUtil.normalizeResolverDefinition(definitionOrReplacement, undefined));
            } else {
                resolverDefinitions = resolverDefinitions.concat(CommonUtil.normalizeResolverDefinition(indexOrPattern, definitionOrReplacement));
            }
        });
    }

    return resolverDefinitions;
};

// Burn in the version
CommonUtil.version = '${build.version}';
