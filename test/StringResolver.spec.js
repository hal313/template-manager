(() => {

    const StringResolver = require('../src/StringResolver');

    describe('StringResolver', () => {

        describe('Lifecycle', () => {

            test('StringResolver should exist as a global', () => {
                expect(StringResolver).toEqual(expect.any(Function));
            });

        });

        describe('API', () => {
            var stringResolver,
                identityResolver,
                template,
                resolved,
                resolverMaps;

            beforeEach(() => {
                // The string resolver instance
                stringResolver = new StringResolver();

                // A simple resolver which will return the regex used; great for testing!
                identityResolver = (regex) => regex;
            });

            afterEach(() => {
                stringResolver = null;
            });

            describe('resolve()', () => {

                describe('Basic Functionality', () => {

                    describe('Caching', () => {
                        var template = 'this is ${resolved}',
                            resolved = 'this is resolved',
                            resolverMap = {resolved: 'resolved'};

                        test('should resolve correctly when cached', () => {
                            expect(new StringResolver(null, {cacheRegex: true}).resolve(template, resolverMap)).toEqual(resolved);
                        });

                        test('should resolve correctly when not cached', () => {
                            expect(new StringResolver(null, {cacheRegex: false}).resolve(template, resolverMap)).toEqual(resolved);
                        });

                    });

                    test('should return undefined when undefined is passed in', () => {
                        expect(stringResolver.resolve(undefined, [])).toBe(undefined);
                        expect(stringResolver.resolve(undefined)).toBe(undefined);
                    });

                    test('should return null when null is passed in', () => {
                        expect(stringResolver.resolve(null, [])).toBe(null);
                        expect(stringResolver.resolve(null)).toBe(null);
                    });

                    test('should return the empty string when the empty string is passed in', () => {
                        expect(stringResolver.resolve('', [])).toBe('');
                        expect(stringResolver.resolve('')).toBe('');
                    });

                    test('should return the original string when the there are no resolvers', () => {
                        expect(stringResolver.resolve('blarg', [])).toBe('blarg');
                        expect(stringResolver.resolve('blarg')).toBe('blarg');
                    });

                    test('should return the identity when the value is undefined (value)', () => {
                        var stringResolver = new StringResolver({someResolver: undefined}),
                            template = 'this is resolved with ${someResolver}';
                        expect(stringResolver.resolve(template)).toEqual(template);
                    });

                    test('should return the identity when the value is undefined (function)', () => {
                        var stringResolver = new StringResolver({someResolver: () => undefined}),
                            template = 'this is resolved with ${someResolver}';
                        expect(stringResolver.resolve(template)).toEqual(template);
                    });

                    test('should return the identity when the value is null (value)', () => {
                        var stringResolver = new StringResolver({someResolver: null}),
                            template = 'this is resolved with ${someResolver}';
                        expect(stringResolver.resolve(template)).toEqual(template);
                    });

                    test('should return the identity when the value is null (function)', () => {
                        var stringResolver = new StringResolver({someResolver: () => null}),
                            template = 'this is resolved with ${someResolver}';
                        expect(stringResolver.resolve(template)).toEqual(template);
                    });

                    test('should support the undefined resolver (value) with shortcut resolvers', () => {
                        var stringResolver = new StringResolver({someResolver: undefined}, {undefinedReplacement: 'undefinedReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    test('should support the undefined resolver (value), with proper resolvers', () => {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: undefined}], {undefinedReplacement: 'undefinedReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    test('should support the undefined resolver (function) with shortcut resolvers', () => {
                        var stringResolver = new StringResolver({someResolver: undefined}, {undefinedReplacement: () => {return 'undefinedReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    test('should support the undefined resolver (function) with proper resolvers', () => {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: undefined}], {undefinedReplacement: () => {return 'undefinedReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    test('should support the null resolver (value) with shortcut resolvers', () => {
                        var stringResolver = new StringResolver({someResolver: null}, {nullReplacement: 'nullReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    test('should support the null resolver (value) with proper resolvers', () => {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: null}], {nullReplacement: 'nullReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    test('should support the null resolver (function) with shortcut resolvers', () => {
                        var stringResolver = new StringResolver({someResolver: null}, {nullReplacement: () => {return 'nullReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    test('should support the null resolver (function) with proper resolvers', () => {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: null}], {nullReplacement: () => {return 'nullReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    test('should support shortcut resolver notation', () => {
                        expect(stringResolver.resolve('this has been ${resolver}', {resolver: 'resolved'})).toEqual('this has been resolved');
                    });

                    test('should support proper resolver notation', () => {
                        expect(stringResolver.resolve('this has been ${resolver}', [{pattern: 'resolver', replacement: 'resolved'}])).toEqual('this has been resolved');
                    });

                    test('should return the empty string when the empty string is passed in', () => {
                        expect(stringResolver.resolve('', [])).toEqual('');
                        expect(stringResolver.resolve('')).toEqual('');
                    });

                    test('should return the original string when the there are no resolvers', () => {
                        expect(stringResolver.resolve('blarg', [])).toEqual('blarg');
                        expect(stringResolver.resolve('blarg')).toEqual('blarg');
                    });

                    test('should throw when a resolver function throws', () => {
                        var template = '${functionResult}',
                            resolverMap = [{ pattern: 'functionResult', replacement: () => { throw Error();} }];
                        expect(() => stringResolver.resolve(template, resolverMap)).toThrow(Error);
                    });

                    test('should fully resolve when a resolver returns a resolver', () => {
                        var resolverMap = {
                            resolverOne: '${resolverTwo}',
                            resolverTwo: 'resolved'
                        },
                            template = 'this is ${resolverOne}',
                            resolved = 'this is resolved';
                        expect(stringResolver.resolve(template, resolverMap)).toEqual(resolved);
                    });

                });

                describe('Simple Resolvers', () => {

                    beforeEach(() => {
                        template = 'this is ${a} simple resolver';
                        resolved = 'this is a simple resolver';
                    });

                    describe('With No Default Resolvers', () => {

                        beforeEach(() => {
                            resolverMaps = {
                                withConstants: [{ pattern: 'a', replacement: 'a' }],
                                withFunctions: [{ pattern: 'a', replacement: identityResolver }]
                            };
                        });

                        test('should process with a constant', () => {
                            expect(stringResolver.resolve(template, resolverMaps.withConstants)).toBe(resolved);
                        });

                        test('should process with a function', () => {
                            expect(stringResolver.resolve(template, resolverMaps.withFunctions)).toBe(resolved);
                        });

                    });

                    describe('With Default Resolvers', () => {

                        test('should process using default resolvers with a constant', () => {
                            var defaultResolverMap = [{ pattern: 'a', replacement: 'a' }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toBe(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toBe(resolved);
                        });

                        test('should process using default resolvers with a function', () => {
                            var defaultResolverMap = [{ pattern: 'a', replacement: identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toBe(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toBe(resolved);
                        });

                    });

                });

                describe('Multiple Resolvers', () => {

                    beforeEach(() => {
                        template = 'this is ${a} ${simple} resolver with multiple resolutions';
                        resolved = 'this is a simple resolver with multiple resolutions';
                    });

                    describe('With No Default Resolvers', () => {
                        var resolverMaps;

                        beforeEach(() => {
                            resolverMaps = {
                                withConstants: [{ pattern: 'a', replacement: 'a' }, { pattern: 'simple', replacement: 'simple' }],
                                withFunctions: [{ pattern: 'a', replacement: identityResolver }, { pattern: 'simple', replacement: identityResolver }]
                            };
                        });

                        test('should process with constants', () => {
                            expect(stringResolver.resolve(template, resolverMaps.withConstants)).toBe(resolved);
                        });

                        test('should process with functions', () => {
                            expect(stringResolver.resolve(template, resolverMaps.withFunctions)).toBe(resolved);
                        });

                    });

                    describe('With Default Resolvers', () => {

                        test('should process using default resolvers with constants', () => {
                            var defaultResolverMap = [{ pattern: 'a', replacement: 'a' }, { pattern: 'simple', replacement: 'simple' }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toBe(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toBe(resolved);
                        });

                        test('should process using default resolvers with functions', () => {
                            var defaultResolverMap = [{ pattern: 'a', replacement: identityResolver }, { pattern: 'simple', replacement: identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toBe(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toBe(resolved);
                        });

                    });

                });

                describe('Embedded Resolvers', () => {

                    beforeEach(() => {
                        template = 'this is ${a${n}} embedded resolver';
                        resolved = 'this is an embedded resolver';
                    });

                    describe('With No Default Resolvers', () => {

                        beforeEach(() => {
                            resolverMaps = {
                                withConstants: [{ pattern: 'an', replacement: 'an' }, { pattern: 'n', replacement: 'n' }],
                                withFunctions: [{ pattern: 'an', replacement: identityResolver }, { pattern: 'n', replacement: identityResolver }]
                            };
                        });

                        test('should process with embedded an constant', () => {
                            expect(stringResolver.resolve(template, resolverMaps.withConstants)).toBe(resolved);
                        });

                        test('should process with an embedded function', () => {
                            expect(stringResolver.resolve(template, resolverMaps.withFunctions)).toBe(resolved);
                        });

                    });

                    describe('With Default Resolvers', () => {

                        test('should process with embedded an constant', () => {
                            var defaultResolverMap = [{ pattern: 'an', replacement: 'an' }, { pattern: 'n', replacement: 'n' }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toBe(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toBe(resolved);
                        });

                        test('should process with an embedded function', () => {
                            var defaultResolverMap = [{ pattern: 'an', replacement: identityResolver }, { pattern: 'n', replacement: identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toBe(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toBe(resolved);
                        });

                    });

                });

            });

        });

        describe('Resolved Bugs', () => {

            test('should process 0 as a resolver', () => {
                var stringResolver = new StringResolver();
                expect(stringResolver.resolve('${r}', [{ pattern: 'r', replacement: 0 }])).toBe('0');
            });

            test('should support the undefined resolver (value), with proper resolvers', () => {
                var template = 'this is resolved with ${someResolver}',
                    resolverMap = [{pattern: 'someResolver', misspelledreplacement: undefined}],
                    stringResolver = new StringResolver(null, {undefinedReplacement: 'undefinedReplaced'});
                expect(() => stringResolver.resolve(template, resolverMap)).toThrow();
            });

        });

    });

})();
