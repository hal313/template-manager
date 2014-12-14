/*global beforeEach,describe,it: true*/
/*global TemplateManager: true*/

// TODO: Test TemplateManager functionality (add(), remove(), load(), get())
// TODO: Test compiled template functionality (raw())

/**
 * @author: jghidiu
 * Date: 2014-12-08
 */

(function() {
    'use strict';

    // A simple resolver which will return the regex used; great for testing!
    var _identityResolver = function(regex) {return regex};

    var _templateNames = {
        nullName: null,
        emptyName: '',
        regularName: 'regular'
    };

    var _templateContent = {
        nullContent: null,
        emptyContent: '',
        regularContent: 'this is ${resolver} regular template'
    };

    var _resolutions = {
        regular: {
            simple: {
                template: {
                    templateName: 'template',
                    templateContent: 'this is ${a} simple resolver'
                },
                resolverMaps: {
                    withConstants: [{regex: 'a', replacement: 'a'}],
                    withFunctions: [{regex: 'a', replacement: _identityResolver}]
                },
                compiled: {
                    content: 'this is a simple resolver'
                }
            },
            multiple: {
                template: {
                    templateName: 'template',
                    templateContent: 'this is ${a} ${simple} resolver'
                },
                resolverMaps: {
                    withConstants: [{regex: 'a', replacement: 'a'}, {regex: 'simple', replacement: 'simple'}],
                    withFunctions: [{regex: 'a', replacement: _identityResolver}, {regex: 'simple', replacement: _identityResolver}]
                },
                compiled: {
                    content: 'this is a simple resolver'
                }
            },
            embedded: {
                template: {
                    templateName: 'template',
                    templateContent: 'this is ${a${n}} embedded resolver'
                },
                resolverMaps: {
                    withConstants: [{regex: 'an', replacement: 'an'}, {regex: 'n', replacement: 'n'}],
                    withFunctions: [{regex: 'an', replacement: _identityResolver}, {regex: 'n', replacement: _identityResolver}]
                },
                compiled: {
                    content: 'this is an embedded resolver'
                }
            }
        }
    };

    beforeEach(function() {
        this.templateManager = new TemplateManager();
    });

    describe('API', function() {

        describe('TemplateManager', function() {

            it('should have a .add() function', function () {
                expect(this.templateManager.add).to.be.a('function');
            });

            it('should have a .get() function', function () {
                expect(this.templateManager.get).to.be.a('function');
            });

            it('should have a .load() function', function () {
                expect(this.templateManager.load).to.be.a('function');
            });

            it('should have a .remove() function', function () {
                expect(this.templateManager.remove).to.be.a('function');
            });

        });

        describe('Compiled Template', function() {

            beforeEach(function() {
                this.regularTemplate = this.templateManager.add(_templateNames.regularName, _templateContent.regularContent);
            });

            it('should have a .raw() function', function() {
                expect(this.regularTemplate.raw).to.be.a('function');
            });

            it('should have a .process() function', function() {
                expect(this.regularTemplate.process).to.be.a('function');
            });


        });

    });

    describe('Compiled Templates', function() {

        describe('Null Template', function() {

            beforeEach(function() {
                this.nullTemplate = this.templateManager.add(_templateNames.nullName, _templateNames.regularName);
            });

            it('should return a compiled template when templateManager.get(null) is invoked', function() {
                expect(this.nullTemplate).to.be.a('object');
            });

            it('should return a compiled template with raw() when templateManager.get(null) is invoked', function() {
                expect(this.nullTemplate.raw).to.be.a('function');
            });

            it('should return a compiled template with process() when templateManager.get(null) is invoked', function() {
                expect(this.nullTemplate.process).to.be.a('function');
            });

            it('should return the empty string when raw() is called on templateManager.get(null)', function() {
                expect(this.nullTemplate.raw()).to.equal('');
            });

            it('should return the empty string when process() is called on templateManager.get(null)', function() {
                expect(this.nullTemplate.process()).to.equal('');
            });

        });

        describe('Empty Template', function() {

            beforeEach(function() {
                this.emptyTemplate = this.templateManager.add(_templateNames.emptyName, _templateContent.emptyContent);
            });

            it('should return a compiled template when templateManager.get(\'\') is invoked', function() {
                expect(this.emptyTemplate).to.be.a('object');
            });

            it('should return a compiled template with raw() when templateManager.get(\'\') is invoked', function() {
                expect(this.emptyTemplate.raw).to.be.a('function');
            });

            it('should return a compiled template with process() when templateManager.get(\'\') is invoked', function() {
                expect(this.emptyTemplate.process).to.be.a('function');
            });

            it('should return the empty string when raw() is called on templateManager.get(\'\')', function() {
                expect(this.emptyTemplate.raw()).to.equal('');
            });

            it('should return the empty string when process() is called on templateManager.get(\'\')', function() {
                expect(this.emptyTemplate.process()).to.equal('');
            });

        });

        describe('Regular Template', function() {

            beforeEach(function() {
                this.regularTemplate = this.templateManager.add(_templateNames.regularName, _templateContent.regularContent);
            });

            it('should return a compiled template when templateManager.get(' + _templateNames.regularName + ') is invoked', function() {
                expect(this.regularTemplate).to.be.a('object');
            });

            it('should return a compiled template with raw() when templateManager.get(' + _templateNames.regularName + ') is invoked', function() {
                expect(this.regularTemplate.raw).to.be.a('function');
            });

            it('should return a compiled template with process() when templateManager.get(' + _templateNames.regularName + ') is invoked', function() {
                expect(this.regularTemplate.process).to.be.a('function');
            });

            it('should return the valid content when raw() is called on templateManager.get(' + _templateNames.regularName + ')', function() {
                expect(this.regularTemplate.raw()).to.equal(_templateContent.regularContent);
            });

            it('should return the valid content when process() is called on templateManager.get(' + _templateNames.regularName + ')', function() {
                expect(this.regularTemplate.process()).to.equal(_templateContent.regularContent);
            });

        });

    });

    describe('Inline loading', function() {

        it('should load scripts from the HTML page', function() {
            var embeddedTemplateName = 'test-template';
            var embeddedTemplateContent = 'This is a template';
            expect(this.templateManager.get(embeddedTemplateName).raw()).to.equal(embeddedTemplateContent);

            console.log(this.templateManager.get('t').raw());
        });

    });

    describe('Template Processing Functionality', function() {

        describe('Simple Resolvers', function() {

            beforeEach(function() {
                this.template = this.templateManager.add(_resolutions.regular.simple.template.templateName, _resolutions.regular.simple.template.templateContent);
            });

            it('should process with a constant', function() {
                expect(this.template.process(_resolutions.regular.simple.resolverMaps.withConstants)).to.equal(_resolutions.regular.simple.compiled.content);
            });

            it('should process with a function', function() {
                expect(this.template.process(_resolutions.regular.simple.resolverMaps.withFunctions)).to.equal(_resolutions.regular.simple.compiled.content);
            });

        });

        describe('Simple Resolvers With Default Resolvers', function() {

            it('should process using default resolvers with a constant', function() {
                var defaultResolverMap = {};
                defaultResolverMap[_resolutions.regular.simple.template.templateName] = [{regex: 'a', replacement: 'a'}];

                this.templateManager = new TemplateManager(defaultResolverMap);
                this.template = this.templateManager.add(_resolutions.regular.simple.template.templateName, _resolutions.regular.simple.template.templateContent);
                expect(this.template.process()).to.equal(_resolutions.regular.simple.compiled.content);
            });

            it('should process using default resolvers with a function', function() {
                var defaultResolverMap = {};
                defaultResolverMap[_resolutions.regular.simple.template.templateName] = [{regex: 'a', replacement: _identityResolver}];

                this.templateManager = new TemplateManager(defaultResolverMap);
                this.template = this.templateManager.add(_resolutions.regular.simple.template.templateName, _resolutions.regular.simple.template.templateContent);
                expect(this.template.process()).to.equal(_resolutions.regular.simple.compiled.content);
            });

        });

        describe('Multiple Resolvers', function() {

            beforeEach(function() {
                this.template = this.templateManager.add(_resolutions.regular.multiple.template.templateName, _resolutions.regular.multiple.template.templateContent);
            });

            it('should process with constants', function() {
                expect(this.template.process(_resolutions.regular.multiple.resolverMaps.withConstants)).to.equal(_resolutions.regular.multiple.compiled.content);
            });

            it('should process with functions', function() {
                expect(this.template.process(_resolutions.regular.multiple.resolverMaps.withFunctions)).to.equal(_resolutions.regular.multiple.compiled.content);
            });

        });

        describe('Multiple Resolvers With Default Resolvers', function() {

            it('should process using default resolvers with constants', function() {
                var defaultResolverMap = {};
                defaultResolverMap[_resolutions.regular.multiple.template.templateName] = [{regex: 'a', replacement: 'a'}, {regex: 'simple', replacement: 'simple'}];

                this.templateManager = new TemplateManager(defaultResolverMap);
                this.template = this.templateManager.add(_resolutions.regular.multiple.template.templateName, _resolutions.regular.multiple.template.templateContent);
                expect(this.template.process()).to.equal(_resolutions.regular.multiple.compiled.content);
            });

            it('should process using default resolvers with functions', function() {
                var defaultResolverMap = {};
                defaultResolverMap[_resolutions.regular.multiple.template.templateName] = [{regex: 'a', replacement: _identityResolver}, {regex: 'simple', replacement: _identityResolver}];

                this.templateManager = new TemplateManager(defaultResolverMap);
                this.template = this.templateManager.add(_resolutions.regular.multiple.template.templateName, _resolutions.regular.multiple.template.templateContent);
                expect(this.template.process()).to.equal(_resolutions.regular.multiple.compiled.content);
            });

        });

        describe('Embedded Resolvers', function() {

            beforeEach(function() {
                this.template = this.templateManager.add(_resolutions.regular.embedded.template.templateName, _resolutions.regular.embedded.template.templateContent);
            });

            it('should process with embedded an constant', function() {
                expect(this.template.process(_resolutions.regular.embedded.resolverMaps.withConstants)).to.equal(_resolutions.regular.embedded.compiled.content);
            });

            it('should process with an embedded function', function() {
                expect(this.template.process(_resolutions.regular.embedded.resolverMaps.withFunctions)).to.equal(_resolutions.regular.embedded.compiled.content);
            });

        });

    });

})();
