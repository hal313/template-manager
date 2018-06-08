/* global StringResolver, beforeEach, describe, to, it, expect: true */

let StringResolver = require('../src/StringResolver');

(() => {
    'use strict';

    describe('StringResolver', () =>  {

        describe('Lifecycle', () =>  {

            it('StringResolver should exist as a global', () =>  {
                expect(StringResolver).toBeInstanceOf(Function);
            });

        });

        describe('API', () =>  {
            var stringResolver,
                // A simple resolver which will return the regex used; great for testing!
                identityResolver = (regex) => regex;

            beforeEach(() =>  {
                // The string resolver instance
                stringResolver = new StringResolver();
            });

            describe('resolve()', () =>  {

                describe('Basic Functionality', () =>  {

                    it('should return undefined when undefined is passed in', () =>  {
                        expect(stringResolver.resolve(undefined, [])).toEqual(undefined);
                        expect(stringResolver.resolve(undefined)).toEqual(undefined);
                    });

                    it('should return null when null is passed in', () =>  {
                        expect(stringResolver.resolve(null, [])).toEqual(null);
                        expect(stringResolver.resolve(null)).toEqual(null);
                    });

                    it('should support the undefined resolver (value) with shortcut resolvers', () =>  {
                        var stringResolver = new StringResolver({someResolver: undefined}, {undefinedReplacement: 'undefinedReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    it('should support the undefined resolver (value), with proper resolvers', () =>  {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: undefined}], {undefinedReplacement: 'undefinedReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    it('should support the undefined resolver (function) with shortcut resolvers', () =>  {
                        var stringResolver = new StringResolver({someResolver: undefined}, {undefinedReplacement: () =>  {return 'undefinedReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    it('should support the undefined resolver (function) with proper resolvers', () =>  {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: undefined}], {undefinedReplacement: () =>  {return 'undefinedReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with undefinedReplaced');
                    });

                    it('should support the null resolver (value) with shortcut resolvers', () =>  {
                        var stringResolver = new StringResolver({someResolver: null}, {nullReplacement: 'nullReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    it('should support the null resolver (value) with proper resolvers', () =>  {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: null}], {nullReplacement: 'nullReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    it('should support the null resolver (function) with shortcut resolvers', () =>  {
                        var stringResolver = new StringResolver({someResolver: null}, {nullReplacement: () =>  {return 'nullReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    it('should support the null resolver (function) with proper resolvers', () =>  {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: null}], {nullReplacement: () =>  {return 'nullReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).toEqual('this is resolved with nullReplaced');
                    });

                    it('should support shortcut resolver notation', () =>  {
                        expect(stringResolver.resolve('this has been ${resolver}', {resolver: 'resolved'})).toEqual('this has been resolved');
                    });

                    it('should support proper resolver notation', () =>  {
                        expect(stringResolver.resolve('this has been ${resolver}', [{pattern: 'resolver', replacement: 'resolved'}])).toEqual('this has been resolved');
                    });

                    it('should return the empty string when the empty string is passed in', () =>  {
                        expect(stringResolver.resolve('', [])).toEqual('');
                        expect(stringResolver.resolve('')).toEqual('');
                    });

                    it('should return the original string when the there are no resolvers', () =>  {
                        expect(stringResolver.resolve('blarg', [])).toEqual('blarg');
                        expect(stringResolver.resolve('blarg')).toEqual('blarg');
                    });

                    it('should throw when a resolver function throws', () =>  {
                        expect(() =>  {
                            stringResolver.resolve('${functionResult}', [{ pattern: 'functionResult', replacement: () =>  { throw Error();} }]);
                        }).toThrow(Error);
                    });

                    it('should fully resolve when a resolver returns a resolver', () =>  {
                        var resolverMap = {
                            resolverOne: '${resolverTwo}',
                            resolverTwo: 'resolved'
                        },
                            template = 'this is ${resolverOne}',
                            resolved = 'this is resolved';
                        expect(stringResolver.resolve(template, resolverMap)).toEqual(resolved);
                    });

                });

                describe('Simple Resolvers', () =>  {
                    var template,
                        resolved;

                    beforeEach(() => {
                        template = 'this is ${a} simple resolver';
                        resolved = 'this is a simple resolver';
                    });

                    describe('With No Default Resolvers', () =>  {
                        var resolverMaps;

                        beforeEach(() => {
                            resolverMaps = {
                                withConstants: [{ pattern: 'a', replacement: 'a' }],
                                withFunctions: [{ pattern: 'a', replacement: identityResolver }]
                            };
                        });

                        it('should process with a constant', () =>  {
                            expect(stringResolver.resolve(template, resolverMaps.withConstants)).toEqual(resolved);
                        });

                        it('should process with a function', () =>  {
                            expect(stringResolver.resolve(template, resolverMaps.withFunctions)).toEqual(resolved);
                        });

                    });

                    describe('With Default Resolvers', () =>  {

                        it('should process using default resolvers with a constant', () =>  {
                            var defaultResolverMap = [{ pattern: 'a', replacement: 'a' }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toEqual(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toEqual(resolved);
                        });

                        it('should process using default resolvers with a function', () =>  {
                            var defaultResolverMap = [{ pattern: 'a', replacement: identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toEqual(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toEqual(resolved);
                        });

                    });

                });

                describe('Multiple Resolvers', () =>  {
                    var template,
                        resolved;

                    beforeEach(() =>  {
                        template = 'this is ${a} ${simple} resolver with multiple resolutions';
                        resolved = 'this is a simple resolver with multiple resolutions';
                    });

                    describe('With No Default Resolvers', () =>  {
                        var resolverMaps;

                        beforeEach(() => {
                            resolverMaps = {
                                withConstants: [{ pattern: 'a', replacement: 'a' }, { pattern: 'simple', replacement: 'simple' }],
                                withFunctions: [{ pattern: 'a', replacement: identityResolver }, { pattern: 'simple', replacement: identityResolver }]
                            };
                        });

                        it('should process with constants', () =>  {
                            expect(stringResolver.resolve(template, resolverMaps.withConstants)).toEqual(resolved);
                        });

                        it('should process with functions', () =>  {
                            expect(stringResolver.resolve(template, resolverMaps.withFunctions)).toEqual(resolved);
                        });

                    });

                    describe('With Default Resolvers', () =>  {

                        it('should process using default resolvers with constants', () =>  {
                            var defaultResolverMap = [{ pattern: 'a', replacement: 'a' }, { pattern: 'simple', replacement: 'simple' }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toEqual(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toEqual(resolved);
                        });

                        it('should process using default resolvers with functions', () =>  {
                            var defaultResolverMap = [{ pattern: 'a', replacement: identityResolver }, { pattern: 'simple', replacement: identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toEqual(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toEqual(resolved);
                        });

                    });

                });

                describe('Embedded Resolvers', () =>  {
                    var template,
                        resolved;

                    beforeEach(() => {
                        template = 'this is ${a${n}} embedded resolver';
                        resolved = 'this is an embedded resolver';
                    });

                    describe('With No Default Resolvers', () =>  {
                        var resolverMaps;

                        beforeEach(() => {
                            resolverMaps = {
                                withConstants: [{ pattern: 'an', replacement: 'an' }, { pattern: 'n', replacement: 'n' }],
                                withFunctions: [{ pattern: 'an', replacement: identityResolver }, { pattern: 'n', replacement: identityResolver }]
                            };
                        });

                        it('should process with embedded an constant', () =>  {
                            expect(stringResolver.resolve(template, resolverMaps.withConstants)).toEqual(resolved);
                        });

                        it('should process with an embedded function', () =>  {
                            expect(stringResolver.resolve(template, resolverMaps.withFunctions)).toEqual(resolved);
                        });

                    });

                    describe('With Default Resolvers', () =>  {

                        it('should process with embedded an constant', () =>  {
                            var defaultResolverMap = [{ pattern: 'an', replacement: 'an' }, { pattern: 'n', replacement: 'n' }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toEqual(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toEqual(resolved);
                        });

                        it('should process with an embedded function', () =>  {
                            var defaultResolverMap = [{ pattern: 'an', replacement: identityResolver }, { pattern: 'n', replacement: identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(template, [])).toEqual(resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(template)).toEqual(resolved);
                        });

                    });

                });

            });

        });

        describe('Resolved Bugs', () =>  {

            it('should process 0 as a resolver', () =>  {
                expect(new StringResolver().resolve('${r}', [{ pattern: 'r', replacement: 0 }])).toEqual('0');
            });

        });

    });

})();
