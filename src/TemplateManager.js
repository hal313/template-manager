// [TemplateManager] Build User: ${build.user}
// [TemplateManager] Version:    ${build.version}
// [TemplateManager] Build Date: ${build.date}

import { CommonUtil } from './CommonUtil';
import { StringResolver } from './StringResolver';

/**
 * Gets an attribute value from an element.
 *
 * @param {Element} element the element to get the attribute from
 * @param {string} name the name of the attribute; it is not necessary to prefix "data-" on the attribute
 * @return {string} the value for the attribute
 */
let getAttribute = (element, name) => {
    return element.getAttribute(name) || element.getAttribute('data-' + name);
};

/**
 * Validates a template name, throwing an Error if the template name is not valid. Valid template names
 * must not be null, undefined or the empty string.
 *
 * @param {string} name the template name to validate
 * @return the passed in name
 * @throws {Error} if the template name is invalid (null, undefined, '')
 */
let validateTemplateName = (name) => {
    if (CommonUtil.isNil(name)) {
        throw new Error('Invalid template name: \'' + name + '\'/');
    }
    // For chaining!
    return name;
};

/**
 * A class to manage templates. Templates can be managed by code via add/get/remove. Further, templates specified
 * in the DOM may be imported via the load() function. A template can be specified in the DOM like so:
 *
 * <script type="text/x-template-manager" data-name="someTemplate">
 *   This is a template with ${resolvers}
 * </script>
 *
 * Template objects (returned from get()) look like:
 * {
 *   raw: () => string, // Returns the original template
 *   process: (resolverMap) => string // Resolves the template
 * }
 *
 */
export class TemplateManager {

    /**
     * Constructor for the TemplateManager.
     *
     * Options:
     * {
     *   // The type attribute for scripts to load from the DOM
     *   scriptType: 'text/x-template-manager'
     * }
     *
     * @param {Object} [defaultResolverMap] the default resolver map to use with all templates
     * @param {Object} [options] options for the TemplateManager instance
     */
    constructor(defaultResolverMap, options) {

        // The options
        let _options = CommonUtil.merge({scriptType: 'text/x-template-manager'}, options);

        // The template cache
        let templateCache = {};

        /**
         *
         * @param {string} name Gets a template by name.
         * @return {string} the template
         */
        let getTemplate = (name) => {
            if (!this.hasTemplate(validateTemplateName(name))) {
                throw new Error('Template \'' + name + '\' does not exist');
            }

            return templateCache[name];
        };

        /**
         * Adds a template into the cache.
         *
         * @param {string} name the template name
         * @param {string} template the template
         */
        let addTemplateToCache = (name, template) => {
            templateCache[validateTemplateName(name)] = template;
        };

        /**
         * Gets a template object with "raw" and "process" functions.
         *
         * @param {string} name the name of the template to get
         * @return {Object} a template object.
         */
        this.get = (name) => {
            // Get the template from the cache
            let template = getTemplate(validateTemplateName(name));

            return {
                /**
                 * Processes a template.
                 *
                 * @param {Object} resolverMap the resolver map
                 * @return {string} a processed template
                 */
                process: function process(resolverMap) {
                    let _resolverMap = [];

                    if (defaultResolverMap) {
                        CommonUtil.forEach(defaultResolverMap, function onResolver(resolver, index) {
                            _resolverMap = _resolverMap.concat(CommonUtil.normalizeResolverDefinition(resolver, index));
                        });
                    }

                    // Populate the resolver map
                    if (resolverMap) {
                        CommonUtil.forEach(resolverMap, function onResolver(resolver, index) {
                            _resolverMap = _resolverMap.concat(CommonUtil.normalizeResolverDefinition(resolver, index));
                        });
                    }
                    return new StringResolver().resolve(template, _resolverMap);
                },
                /**
                 * Returns the raw template.
                 *
                 * @return {string} the template
                 */
                raw: function raw() {
                    return template;
                }
            };
        };

        /**
         * Adds a template to the TemplateManager
         *
         * @param {string} name the template name
         * @param {string} template the template
         * @throws {Error} if the template name is not valid, the template name exists or template is not defined
         */
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

        /**
         * Loads templates from the DOM into the TemplateManager.
         *
         * @param {Element} [rootElement] the element to load from
         */
        this.load = (rootElement) => {
            // Get all the script elements
            let scriptElements = (rootElement||document).getElementsByTagName('script');

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

        /**
         * Removes a template from the TemplateManager.
         *
         * @param {string} name the template name to remove
         */
        this.remove = (name) => {
            delete templateCache[validateTemplateName(name)];
        };

        /**
         * Gets an array of template names.
         *
         * @returns {string[]} an array of template names managed by this TemplateManager
         */
        this.getTemplateNames = () => {
            let names = [];

            CommonUtil.forEach(templateCache, function (value, name) {
                names.push(name);
            });

            return names;
        };

        /**
         * Determines if this TemplateManager instance manages a template with the specifed name.
         *
         * @param {string} name determines if this TemplateManager instance has a specified template
         * @returns {boolean} true, if this TemplateManager instance has a template with the specified name; false otherwise
         */
        this.hasTemplate = (name) => {
            return CommonUtil.isDefined(templateCache[validateTemplateName(name)]);
        };

        /**
         * Empties this TemplateManager instance.
         */
        this.empty = () => {
            templateCache = {};
        };

    }

}

// Place the version as a member in the function
TemplateManager.version = '${build.version}';
