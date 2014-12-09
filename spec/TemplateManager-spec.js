/**
 * @author: jghidiu
 * Email: jghidiu@paychex.com
 * Date: 2014-12-08
 */

(function() {
    'use strict';

    var _templateNames = {
        'nullTemplate': null,
        'emptyTemplate': '',
        'regularTemplate': 'this is {a} regular template'
    };

    beforeEach(function() {
        this.templateManager = new TemplateManager();
    });

    describe('Lifecycle', function() {

        it('should exist', function () {
            expect(TemplateManager).to.be.a('function');
        });

    });

    describe('API', function() {

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

        // TODO: Check params passed in

        describe('Compiled Template API', function() {

            beforeEach(function() {
                this.emptyTemplate = this.templateManager.get('non template');
            });

            it('should have a .raw() function', function() {
                expect(this.emptyTemplate.raw).to.be.a('function');
            });

            it('should have a .process() function', function() {
                expect(this.emptyTemplate.process).to.be.a('function');
            });

            // TODO: Check params passed in, null, etc, template functionality, etc

        });

    });

    describe('Template Cache', function() {

        it('should load manually', function() {
            var compiledTemplate = this.templateManager.get('someTemplate');
            //templateManager.add('test', '{test}');
            //var compiledTemplate = templateManager.get('test');
            //console.log('compiledTemplate', compiledTemplate.raw());
            expect(compiledTemplate.raw()).to.be.null;
            //console.log(compiledTemplate.process());
        });

    });

})();
