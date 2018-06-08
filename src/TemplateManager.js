// Build User: ${build.user}
// Version: ${build.version}
// Build Date: ${build.date}

// TODO: es6
// TODO: jsdoc

// TODO: FEATURE: Allow escape (this will have to be figured out in the regular expression)
// TODO: FEATURE: Support nameless/anon scripts in load (supply fake name?)?
// TODO: FEATURE: Support named resolver maps (<script ...name="..." resolver="...")
// TODO: FEATURE: .add() should take in an optional third argument (resolver map)

import { CommonUtil } from './CommonUtil';
import { StringResolver } from './StringResolver';

let getAttribute = (element, name) => {
    return element.getAttribute(element, name) || element.getAttribute('data-' + name);
};

let validateTemplateName = (name) => {
    if (CommonUtil.isNil(name)) {
        throw new Error('Invalid template name: \'' + name + '\'/');
    }
    // For chaining!
    return name;
};

let rawTemplate = (templateName, template) => {
    return template;
};

let processTemplate = (template, resolverMap) => {
    var _resolverMap = [];

    if (defaultResolverMap) {
        CommonUtil.forEach(defaultResolverMap, function onResolver(resolver, index) {
            _resolverMap.push(CommonUtil.normalizeResolverDefinition(resolver, index));
        });
    }

    // Populate the resolver map
    if (resolverMap) {
        CommonUtil.forEach(resolverMap, function onResolver(resolver, index) {
            _resolverMap.push(CommonUtil.normalizeResolverDefinition(resolver, index));
        });
    }

    return new StringResolver().resolve(template, _resolverMap);
};

let getTemplate = (name) => {
    if (!hasTemplate(validateTemplateName(name))) {
        throw new Error('Template \'' + name + '\' does not exist');
    }

    return this.templateCache[name];
};

let addTemplateToCache = (name, template) => {
    templateCache[validateTemplateName(name)] = template;
};


export class TemplateManager {

    constructor(defaultResolverMap, options) {

        // The options
        this.options = CommonUtil.merge({scriptType: 'text/x-template-manager'}, options);

        // The template cache
        this.templateCache = {};
    };

    get(name) {
        // Get the template from the cache
        var template = getTemplate(validateTemplateName(name));

        return {
            process: function process(resolverMap) {
                return processTemplate(template, resolverMap);
            },
            raw: function raw() {
                return rawTemplate(name, template);
            }
        };
    };

    add(name, template) {
        var templateName = validateTemplateName(name);

        if (this.hasTemplate(templateName)) {
            throw new Error('Duplicate template name \'' + name + '\'');
        }

        if (!CommonUtil.isDefined(template)) {
            throw new Error('Template must be defined');
        }

        addTemplateToCache(templateName, template);
        return this.get(templateName);
    };

    load() {
        // Get all the script elements
        var scriptElements = document.getElementsByTagName('script');

        // Add each template into the cache
        CommonUtil.forEach(scriptElements, function (scriptElement, index) {
            var name,
                content;

            // Check to see if the script type matches the type desired
            if (this.options.scriptType === scriptElement.type) {
                // Get the name
                name = getAttribute(scriptElement, 'name');
                // Get the content
                content = scriptElement.innerHTML.trim();

                validateTemplateName(name);
                // Add to the cache
                addTemplateToCache(name, content);
            }
        });
    };

    remove(name) {
        delete this.templateCache[validateTemplateName(name)];
    }

    getTemplateNames() {
        var names = [];

        CommonUtil.forEach(this.templateCache, function (value, name) {
            names.push(name);
        });

        return names;
    };

    hasTemplate(name) {
        return CommonUtil.isDefined(this.templateCache[validateTemplateName(name)]);
    };

    empty() {
        this.templateCache = {};
    };

};

// load: load,
// get: get,
// add: add,
// remove: remove,
// getTemplateNames: getTemplateNames,
// hasTemplate: hasTemplate,
// empty: empty

// Place the version as a member in the function
TemplateManager.version = '${build.version}';