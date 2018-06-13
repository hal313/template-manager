# [template-manager](https://github.com/hal313/template-manager)

[![Build Status](http://img.shields.io/travis/hal313/template-manager/master.svg?style=flat-square)](https://travis-ci.org/hal313/template-manager)
[![NPM version](http://img.shields.io/npm/v/template-manager.svg?style=flat-square)](https://www.npmjs.com/package/template-manager)
[![Dependency Status](http://img.shields.io/david/hal313/template-manager.svg?style=flat-square)](https://david-dm.org/hal313/template-manager)

> JavaScript implementation of a basic template manager and string resolver

# Introduction
A library which supports templating and resolving templates. Two classes exist to this end. The **TemplateManager** class is used to manage templates loaded via code as well as to load templates from the DOM. The **StringResolver** class can be used to replace *resolvers* within a string (or template) with values held in objects.


## Installing

```sh
$ npm install template-manager
```

## Using

How you create instances of objects depends largely on your environment. If you are using ES6, you may leverage import statements:
```
import { StringResolver } from '../path/to/TemplateManager';
```

When using `require`:
```
var StringResolver = require('template-manager').StringResolver;
```

Lastly, when running in a browser environment with no module loader:
```
var StringResolver = TemplateManager.StringResolver;
```

### API
#### StringResolver

> new StringResolver(defaultResolverMap, options)
Creates a new StringResolver instance with an optional default resolver map and options.

```
// StringResolver.identityResolver is a function which returns the resolver. For example, `${someResolver}` will resolve to `${someResolver}`

options {
    // nullReplacement: the replacement to use when the value
    // in the map is null
    // Can be a string, object or function which returns an object
    nullReplacement: StringResolver.identityResolver,
    // undefinedReplacement: the replacement to use when the value
    // in the map is undefined (or missing)
    // Can be a string, object or function which returns an object
    undefinedReplacement: StringResolver.identityResolver
}
```

>resolve(template, resolverMap)

Returns the resolved template. The *template* is a string with resolvers formatted as `${someResolver}` and *resolverMap* is an object with keys whose values are the resolved value. For example:
```
var resolverMap = {
    someResolver: 'this is a simple resolver',
    someFunction: function () {return 'this is a functional resolver';}
},
    template = 'simple: ${someResolver} and functional: ${someFunction}';

new StringResolver(template, resolverMap); // "simple: this is a simple resolver and functional: this is a functional resolver"
```
#### TemplateManager
> new TemplateManager(defaultResolverMap={}[, options])

Creates a new TemplateManager instance with a default resolver map which is used in every template and optional options:
```
{
    // The type attribute for scripts to load from the DOM
    scriptType: 'text/x-template-manager'
}
```

> get(name: string): string

Gets a template with the specified name. The template object looks like:
```
{
    raw: () => string, // Returns the raw template
    process: (resolverMap: Object) => string // Resolves the template with the resolver map
}
```

> add(name: string, template: string): void

Adds a template to the TemplateManager instance.

> load(): void

Loads templates from the DOM. Each script element should have a type of "text/x-template-manager" and a "name" attribute.

> remove(name: string): void

Removes a named template from the TemplateManager instance.

> getTemplateNames(): string[]

Gets an array of all the template names for this TemplateManager.

> hasTemplate(name: string): boolean

Determines if a template with the specified name is managed by this TemplateManager.

> empty(): void

Removes all templates from a TemplateManager instance.


## Building
```
npm install -g grunt
npm install
npm run build
```


### Building Continuously
```
npm run build:watch
```


### Running Tests
Tests expect to be run against an distribution, so be sure to build before running tests.

```
npm run test
```

To re-run tests during development:
```
npm run test:watch
```


## Deploying
This is a basic script which can be used to build and deploy (to NPM) the project.

```
export VERSION=0.0.16
git checkout -b release/$VERSION
npm version --no-git-tag-version patch
npm run build
npm run test
git add package*
git commit -m 'Version bump'
git add dist/
git commit -m 'Generated artifacts'
git checkout master
git merge --no-ff release/$VERSION
git tag -a -m 'Tagged for release' $VERSION
git branch -d release/$VERSION
git checkout develop
git merge --no-ff master
git push --all && git push --tags
```