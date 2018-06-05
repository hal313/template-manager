var StringResolver = require('./src/StringResolver');
var stringResolver = new StringResolver(null, {undefinedReplacement: 'undefinedReplaced'});

stringResolver.resolve('this is resolved with ${someResolver}', [{pattern: 'someResolver', replacements: undefined}]);