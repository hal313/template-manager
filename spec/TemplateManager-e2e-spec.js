/* global TemplateManager, beforeEach, describe, it: true */

(function() {
    'use strict';

    describe('Template Manager', function () {

        describe('Lifecycle', function() {

            it('TemplateManager should exist as a global', function () {
                expect(TemplateManager).to.be.a('function');
            });

        });

        describe('Inline loading', function () {

            beforeEach(function () {
                this.templateManager = new TemplateManager();
                this.templateManager.load();

                this.embeddedTemplateName = 'test-template';
                this.embeddedTemplateContent = 'This is a ${resolved} template';
                this.embeddedTemplateResolvedContent = 'This is a resolved template';
                this.resolverMap = {resolved: 'resolved'};
            });

            it('should load scripts from the HTML page', function () {
                expect(this.templateManager.get(this.embeddedTemplateName)).not.to.be.undefined;
            });

            it('should load scripts from the HTML page and provide raw content', function () {
                expect(this.templateManager.get(this.embeddedTemplateName).raw()).to.equal(this.embeddedTemplateContent);
            });

            it('should load scripts from the HTML page and process correctly', function () {
                expect(this.templateManager.get(this.embeddedTemplateName).process(this.resolverMap)).to.equal(this.embeddedTemplateResolvedContent);
            });

        });

    });

})();
