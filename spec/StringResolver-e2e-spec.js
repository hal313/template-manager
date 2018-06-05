/* global StringResolver, beforeEach, describe, it: true */

(function () {
    'use strict';

    describe('StringResolver', function () {

        describe('Lifecycle', function() {

            it('StringResolver should exist as a global', function () {
                expect(StringResolver).to.be.a('function');
            });

        });

        describe('API', function () {

            beforeEach(function () {
                // The string resolver instance
                this.stringResolver = new StringResolver();

                // A simple resolver which will return the regex used; great for testing!
                this.identityResolver = function (regex) { return regex; };
            });

            describe('resolve()', function () {

                describe('Basic Functionality', function () {

                    it('should return undefined when undefined is passed in', function () {
                        expect(this.stringResolver.resolve(undefined, [])).to.equal(undefined);
                        expect(this.stringResolver.resolve(undefined)).to.equal(undefined);
                    });

                    it('should return null when null is passed in', function () {
                        expect(this.stringResolver.resolve(null, [])).to.equal(null);
                        expect(this.stringResolver.resolve(null)).to.equal(null);
                    });

                    it('should support the undefined resolver (value) with shortcut resolvers', function () {
                        var stringResolver = new StringResolver({someResolver: undefined}, {undefinedReplacement: 'undefinedReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with undefinedReplaced');
                    });

                    it('should support the undefined resolver (value), with proper resolvers', function () {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: undefined}], {undefinedReplacement: 'undefinedReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with undefinedReplaced');
                    });

                    it('should support the undefined resolver (function) with shortcut resolvers', function () {
                        var stringResolver = new StringResolver({someResolver: undefined}, {undefinedReplacement: function () {return 'undefinedReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with undefinedReplaced');
                    });

                    it('should support the undefined resolver (function) with proper resolvers', function () {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: undefined}], {undefinedReplacement: function () {return 'undefinedReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with undefinedReplaced');
                    });

                    it('should support the null resolver (value) with shortcut resolvers', function () {
                        var stringResolver = new StringResolver({someResolver: null}, {nullReplacement: 'nullReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with nullReplaced');
                    });

                    it('should support the null resolver (value) with proper resolvers', function () {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: null}], {nullReplacement: 'nullReplaced'});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with nullReplaced');
                    });

                    it('should support the null resolver (function) with shortcut resolvers', function () {
                        var stringResolver = new StringResolver({someResolver: null}, {nullReplacement: function () {return 'nullReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with nullReplaced');
                    });

                    it('should support the null resolver (function) with proper resolvers', function () {
                        var stringResolver = new StringResolver([{pattern: 'someResolver', replacement: null}], {nullReplacement: function () {return 'nullReplaced';}});
                        expect(stringResolver.resolve('this is resolved with ${someResolver}')).to.equal('this is resolved with nullReplaced');
                    });

                    it('should support shortcut resolver notation', function () {
                        expect(this.stringResolver.resolve('this has been ${resolver}', {resolver: 'resolved'})).to.equal('this has been resolved');
                    });

                    it('should support proper resolver notation', function () {
                        expect(this.stringResolver.resolve('this has been ${resolver}', [{pattern: 'resolver', replacement: 'resolved'}])).to.equal('this has been resolved');
                    });

                    it('should return the empty string when the empty string is passed in', function () {
                        expect(this.stringResolver.resolve('', [])).to.equal('');
                        expect(this.stringResolver.resolve('')).to.equal('');
                    });

                    it('should return the original string when the there are no resolvers', function () {
                        expect(this.stringResolver.resolve('blarg', [])).to.equal('blarg');
                        expect(this.stringResolver.resolve('blarg')).to.equal('blarg');
                    });

                    it('should throw when a resolver function throws', function () {
                        expect(function () {
                            this.stringResolver.resolve('${functionResult}', [{ pattern: 'functionResult', replacement: function () { throw Error();} }]);
                        }).to.throw(Error);
                    });

                    it('should fully resolve when a resolver returns a resolver', function () {
                        var resolverMap = {
                            resolverOne: '${resolverTwo}',
                            resolverTwo: 'resolved'
                        },
                            template = 'this is ${resolverOne}',
                            resolved = 'this is resolved';
                        expect(this.stringResolver.resolve(template, resolverMap)).to.equal(resolved);
                    });

                });

                describe('Simple Resolvers', function () {

                    beforeEach(function setupVars() {
                        this.template = 'this is ${a} simple resolver';
                        this.resolved = 'this is a simple resolver';
                    });

                    describe('With No Default Resolvers', function () {

                        beforeEach(function setupVars() {
                            this.resolverMaps = {
                                withConstants: [{ pattern: 'a', replacement: 'a' }],
                                withFunctions: [{ pattern: 'a', replacement: this.identityResolver }]
                            };
                        });

                        it('should process with a constant', function () {
                            expect(this.stringResolver.resolve(this.template, this.resolverMaps.withConstants)).to.equal(this.resolved);
                        });

                        it('should process with a function', function () {
                            expect(this.stringResolver.resolve(this.template, this.resolverMaps.withFunctions)).to.equal(this.resolved);
                        });

                    });

                    describe('With Default Resolvers', function () {

                        it('should process using default resolvers with a constant', function () {
                            var defaultResolverMap = [{ pattern: 'a', replacement: 'a' }];

                            expect(new StringResolver(defaultResolverMap).resolve(this.template, [])).to.equal(this.resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(this.template)).to.equal(this.resolved);
                        });

                        it('should process using default resolvers with a function', function () {
                            var defaultResolverMap = [{ pattern: 'a', replacement: this.identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(this.template, [])).to.equal(this.resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(this.template)).to.equal(this.resolved);
                        });

                    });

                });

                describe('Multiple Resolvers', function () {

                    beforeEach(function () {
                        this.template = 'this is ${a} ${simple} resolver with multiple resolutions';
                        this.resolved = 'this is a simple resolver with multiple resolutions';
                    });

                    describe('With No Default Resolvers', function () {

                        beforeEach(function setupResolverMaps() {
                            this.resolverMaps = {
                                withConstants: [{ pattern: 'a', replacement: 'a' }, { pattern: 'simple', replacement: 'simple' }],
                                withFunctions: [{ pattern: 'a', replacement: this.identityResolver }, { pattern: 'simple', replacement: this.identityResolver }]
                            };
                        });

                        it('should process with constants', function () {
                            expect(this.stringResolver.resolve(this.template, this.resolverMaps.withConstants)).to.equal(this.resolved);
                        });

                        it('should process with functions', function () {
                            expect(this.stringResolver.resolve(this.template, this.resolverMaps.withFunctions)).to.equal(this.resolved);
                        });

                    });

                    describe('With Default Resolvers', function () {

                        it('should process using default resolvers with constants', function () {
                            var defaultResolverMap = [{ pattern: 'a', replacement: 'a' }, { pattern: 'simple', replacement: 'simple' }];

                            expect(new StringResolver(defaultResolverMap).resolve(this.template, [])).to.equal(this.resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(this.template)).to.equal(this.resolved);
                        });

                        it('should process using default resolvers with functions', function () {
                            var defaultResolverMap = [{ pattern: 'a', replacement: this.identityResolver }, { pattern: 'simple', replacement: this.identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(this.template, [])).to.equal(this.resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(this.template)).to.equal(this.resolved);
                        });

                    });

                });

                describe('Embedded Resolvers', function () {

                    beforeEach(function setupVars() {
                        this.template = 'this is ${a${n}} embedded resolver';
                        this.resolved = 'this is an embedded resolver';
                    });

                    describe('With No Default Resolvers', function () {

                        beforeEach(function setupVars() {
                            this.resolverMaps = {
                                withConstants: [{ pattern: 'an', replacement: 'an' }, { pattern: 'n', replacement: 'n' }],
                                withFunctions: [{ pattern: 'an', replacement: this.identityResolver }, { pattern: 'n', replacement: this.identityResolver }]
                            };
                        });

                        it('should process with embedded an constant', function () {
                            expect(this.stringResolver.resolve(this.template, this.resolverMaps.withConstants)).to.equal(this.resolved);
                        });

                        it('should process with an embedded function', function () {
                            expect(this.stringResolver.resolve(this.template, this.resolverMaps.withFunctions)).to.equal(this.resolved);
                        });

                    });

                    describe('With Default Resolvers', function () {

                        it('should process with embedded an constant', function () {
                            var defaultResolverMap = [{ pattern: 'an', replacement: 'an' }, { pattern: 'n', replacement: 'n' }];

                            expect(new StringResolver(defaultResolverMap).resolve(this.template, [])).to.equal(this.resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(this.template)).to.equal(this.resolved);
                        });

                        it('should process with an embedded function', function () {
                            var defaultResolverMap = [{ pattern: 'an', replacement: this.identityResolver }, { pattern: 'n', replacement: this.identityResolver }];

                            expect(new StringResolver(defaultResolverMap).resolve(this.template, [])).to.equal(this.resolved);
                            expect(new StringResolver(defaultResolverMap).resolve(this.template)).to.equal(this.resolved);
                        });

                    });

                });

            });

        });

        describe('Resolved Bugs', function () {

            it('should process 0 as a resolver', function () {
                expect(new StringResolver().resolve('${r}', [{ pattern: 'r', replacement: 0 }])).to.equal('0');
            });

        });

    });

})();
