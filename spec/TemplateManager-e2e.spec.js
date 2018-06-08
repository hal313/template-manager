/* global TemplateManager, beforeEach, describe, it: true */

(() =>  {
    'use strict';

    const TemplateManager = require('../src/TemplateManager');

    describe('Template Manager', () =>  {

        describe('Lifecycle', () =>  {

            it('TemplateManager should exist as a global', () =>  {
                expect(TemplateManager).toBeInstanceOf('function');
            });

        });

        describe('Inline loading', () =>  {
            var templateManager,
                embeddedTemplateName,
                embeddedTemplateContent,
                embeddedTemplateResolvedContent,
                resolverMap;


            beforeEach(() =>  {
                templateManager = new TemplateManager();
                // TODO: Load from DOM (test-template)
                templateManager.load();

                embeddedTemplateName = 'test-template';
                embeddedTemplateContent = 'This is a ${resolved} template';
                embeddedTemplateResolvedContent = 'This is a resolved template';
                resolverMap = {resolved: 'resolved'};
            });

            it('should load scripts from the HTML page', () =>  {
                expect(templateManager.get(embeddedTemplateName)).not.toBeDefined();
            });

            it('should load scripts from the HTML page and provide raw content', () =>  {
                expect(templateManager.get(embeddedTemplateName).raw()).toEqual(embeddedTemplateContent);
            });

            it('should load scripts from the HTML page and process correctly', () =>  {
                expect(templateManager.get(embeddedTemplateName).process(resolverMap)).toEqual(embeddedTemplateResolvedContent);
            });

        });

    });

})();
