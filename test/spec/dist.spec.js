(() => {

    var Module = require('../../dist/TemplateManager'),
        StringResolverRunner = require('./../util/StringResolverRunner'),
        TemplateManagerRunner = require('./../util/TemplateManagerRunner');

    StringResolverRunner().runSpecs(Module.StringResolver);
    TemplateManagerRunner().runSpecs(Module.TemplateManager);

})();