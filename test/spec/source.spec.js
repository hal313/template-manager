(() => {
    'use strict';

    var StringResolver = require('../../src/StringResolver').StringResolver,
        TemplateManager = require('../../src/TemplateManager').TemplateManager,
        StringResolverRunner = require('./../util/StringResolverRunner'),
        TemplateManagerRunner = require('./../util/TemplateManagerRunner');

    StringResolverRunner().runSpecs(StringResolver);
    TemplateManagerRunner().runSpecs(TemplateManager);

})();