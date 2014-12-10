/*global beforeEach,describe,it: true*/
/*global TemplateManager: true*/

// TODO: Also test amd and require

/**
 * @author: jghidiu
 * Email: jghidiu@solutechnology.com
 * Date: 2014-12-08
 */

(function() {
    'use strict';

    beforeEach(function() {
        this.templateManager = new TemplateManager();
    });

    describe('Lifecycle', function() {

        it('TemplateManager should exist as a global', function () {
            expect(TemplateManager).to.be.a('function');
        });

    });

})();
