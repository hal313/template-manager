// Build User: ${build.user}
// Version: ${build.version}
// Build Date: ${build.date}

// TODO: es6
// TODO: jsdoc

export class CommonUtil {

};

let isResolverDefinition = (definition) => {
    return !!definition && definition.hasOwnProperty('pattern') && definition.hasOwnProperty('replacement');
};

CommonUtil.forEach = (collection, callback) => {
    if (Array.isArray(collection)) {
        collection.forEach(callback);
    } else {
        Object.getOwnPropertyNames(collection).forEach(function onItem(propertyName) {
            callback(collection[propertyName], propertyName);
        });
    }
};

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

CommonUtil.isDefined = (value) => {
    return undefined !== value && null !== value;
};

CommonUtil.isNil = (value) => {
    // Return true if:
    //  value is NOT defined
    //  OR value IS defined AND it is the empty string (when trimmed)
    return !CommonUtil.isDefined(value) || (CommonUtil.isDefined(value) && '' === value.toString().trim());
};

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

CommonUtil.normalizeResolverDefinition = (definitionOrPattern, replacement) => {
    if (isResolverDefinition(definitionOrPattern)) {
        // Duck type for 'classic' resolvers
        return CommonUtil.createResolverDefinition(definitionOrPattern.pattern, definitionOrPattern.replacement);
    } else {
        // Reverse the parameters (this is an object with key/value parings)
        return CommonUtil.createResolverDefinition(definitionOrPattern, replacement);
    }
};

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
