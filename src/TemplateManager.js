// [TemplateManager] Build User: ${build.user}
// [TemplateManager] Version:    ${build.version}
// [TemplateManager] Build Date: ${build.date}

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

let processTemplate = (template, resolverMap, defaultResolverMap) => {
    let _resolverMap = [];

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

export class TemplateManager {

    constructor(defaultResolverMap, options) {

        // The options
        let _options = CommonUtil.merge({scriptType: 'text/x-template-manager'}, options);

        // The template cache
        let templateCache = {};

        let getTemplate = (name) => {
            if (!this.hasTemplate(validateTemplateName(name))) {
                throw new Error('Template \'' + name + '\' does not exist');
            }

            return templateCache[name];
        };

        let addTemplateToCache = (name, template) => {
            templateCache[validateTemplateName(name)] = template;
        };

        this.get = (name) => {
            // Get the template from the cache
            let template = getTemplate(validateTemplateName(name));

            return {
                process: function process(resolverMap) {
                    return processTemplate(template, resolverMap, defaultResolverMap);
                },
                raw: function raw() {
                    return rawTemplate(name, template);
                }
            };
        };

        this.add = (name, template) => {
            let templateName = validateTemplateName(name);

            if (this.hasTemplate(templateName)) {
                throw new Error('Duplicate template name \'' + name + '\'');
            }

            if (!CommonUtil.isDefined(template)) {
                throw new Error('Template must be defined');
            }

            addTemplateToCache(templateName, template);
            return this.get(templateName);
        };

        this.load = (root) => {
            // Get all the script elements
            let scriptElements = (root||document).getElementsByTagName('script');

            // Add each template into the cache
            CommonUtil.forEach(scriptElements, function (scriptElement, index) {
                let name,
                    content;

                // Check to see if the script type matches the type desired
                if (_options.scriptType === scriptElement.type) {
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

        this.remove = (name) => {
            delete templateCache[validateTemplateName(name)];
        };

        this.getTemplateNames = () => {
            let names = [];

            CommonUtil.forEach(templateCache, function (value, name) {
                names.push(name);
            });

            return names;
        };

        this.hasTemplate = (name) => {
            return CommonUtil.isDefined(templateCache[validateTemplateName(name)]);
        };

        this.empty = () => {
            templateCache = {};
        };

    }

}

// Place the version as a member in the function
TemplateManager.version = '${build.version}';
