import { CommonUtil } from '../src/CommonUtil';

(() => {

    describe('CommonUtil', () => {

        describe('Lifecycle', () => {

            test('CommonUtil should exist as a global', () => {
                expect(CommonUtil).toEqual(expect.any(Function));
            });

        });

        describe('API', () => {

            describe('forEach()', () => {

                test('should be a function', () => {
                    expect(CommonUtil.forEach).toEqual(expect.any(Function));
                });

                test('should iterate through an array', () => {
                    let target = ['one', 'two', 'three'],
                        loopCount = 0;

                    CommonUtil.forEach(target, (item, index) => {
                        // Check the parameters
                        expect(item).toEqual(expect.any(String));
                        expect(index).toEqual(expect.any(Number));
                        expect(target[index]).toEqual(item);

                        // Increment the loop count
                        ++loopCount;
                    });

                    // Check that the loop was fully iterated through
                    expect(loopCount).toBe(target.length);
                });

                test('should iterate through an object', () => {
                    let target = {
                        one: 'once',
                        two: 'twice',
                        three: 'thrice'
                    },
                        loopCount = 0;

                    CommonUtil.forEach(target, (value, name) => {
                        // Check the parameters
                        expect(value).toEqual(expect.any(String));
                        expect(name).toEqual(expect.any(String));
                        expect(target[name]).toEqual(value);

                        // Increment the loop count
                        ++loopCount;
                    });

                    // Check that the loop was fully iterated through
                    expect(loopCount).toBe(Object.getOwnPropertyNames(target).length);
                });

            });

            describe('merge()', () => {

                test('should be a function', () => {
                    expect(CommonUtil.merge).toEqual(expect.any(Function));
                });

                test('should return an empty object when no parameters are passed', () => {
                    let merged = CommonUtil.merge();
                    expect(merged).toEqual({});
                });

                test('should return an empty object when undefined is passed', () => {
                    let merged = CommonUtil.merge(undefined);
                    expect(merged).toEqual({});
                });

                test('should return an empty object when null is passed', () => {
                    let merged = CommonUtil.merge(null);
                    expect(merged).toEqual({});
                });

                test('should merge a simple object', () => {
                    let merged = CommonUtil.merge({a: 'a'});
                    expect(merged).toEqual({a: 'a'});
                });

                test('should merge two simple objects', () => {
                    let merged = CommonUtil.merge({a: 'a'}, {b: 'b'});
                    expect(merged).toEqual({a: 'a', b: 'b'});
                });

                test('should merge three simple objects', () => {
                    let merged = CommonUtil.merge({a: 'a'}, {b: 'b'}, {c: 'c'});
                    expect(merged).toEqual({a: 'a', b: 'b', c: 'c'});
                });

                test('should merge multiple simple objects, ignoring undefined and null', () => {
                    let merged = CommonUtil.merge({a: 'a'}, undefined, {b: 'b'}, null, {c: 'c'});
                    expect(merged).toEqual({a: 'a', b: 'b', c: 'c'});
                });

                test('should merge with overwrite', () => {
                    let merged = CommonUtil.merge({a: 'a', b: 'b', c: 'c'}, {b: 'bee'});
                    expect(merged).toEqual({a: 'a', b: 'bee', c: 'c'});
                });

                test('should merge with multiple overwrite', () => {
                    let merged = CommonUtil.merge({a: 'a', b: 'b', c: 'c'}, {b: 'bee'}, {b: 'bae'});
                    expect(merged).toEqual({a: 'a', b: 'bae', c: 'c'});
                });

            });

            describe('isDefined', () => {

                test('should return false when undefined is passed in', () => {
                    expect(CommonUtil.isDefined(undefined)).toBeFalsy();
                });

                test('should return false when null is passed in', () => {
                    expect(CommonUtil.isDefined(null)).toBeFalsy();
                });

                test('should return true when the empty string is passed in', () => {
                    expect(CommonUtil.isDefined('')).toBeTruthy();
                });

                test('should return true when 0 is passed in', () => {
                    expect(CommonUtil.isDefined(0)).toBeTruthy();
                });

            });

            describe('isNil', () => {

                test('should return true when undefined is passed in', () => {
                    expect(CommonUtil.isNil(undefined)).toBeTruthy();
                });

                test('should return true when null is passed in', () => {
                    expect(CommonUtil.isNil(null)).toBeTruthy();
                });

                test('should return true when the empty string is passed in', () => {
                    expect(CommonUtil.isNil('')).toBeTruthy();
                });

                test('should return false when 0 is passed in', () => {
                    expect(CommonUtil.isNil(0)).toBeFalsy();
                });

            });

            describe('isFunction', () => {

                test('should return true when a function is passed in', () => {
                    expect(CommonUtil.isFunction(() => {})).toBeTruthy();
                });

                test('should return false when undefined is passed in', () => {
                    expect(CommonUtil.isFunction(undefined)).toBeFalsy();
                });

                test('should return false when null is passed in', () => {
                    expect(CommonUtil.isFunction(null)).toBeFalsy();
                });

                test('should return false when the empty string is passed in', () => {
                    expect(CommonUtil.isFunction('')).toBeFalsy();
                });

                test('should return false when 0 is passed in', () => {
                    expect(CommonUtil.isFunction(0)).toBeFalsy();
                });

                test('should return false when a string is passed in', () => {
                    expect(CommonUtil.isFunction('some string')).toBeFalsy();
                });

                test('should return false when a number is passed in', () => {
                    expect(CommonUtil.isFunction(123)).toBeFalsy();
                });

                test('should return false when a boolean is passed in', () => {
                    expect(CommonUtil.isFunction(true)).toBeFalsy();
                });

                test('should return false when a boolean is passed in', () => {
                    expect(CommonUtil.isFunction(false)).toBeFalsy();
                });
            });

            describe('createResolverDefinition()', () => {

                test('should create a resolver definition object', () => {
                    expect(CommonUtil.createResolverDefinition('a', 'b')).toEqual({pattern: 'a', replacement: 'b'});
                });

                test('should throw when the pattern is undefined', () => {
                    expect(() => CommonUtil.createResolverDefinition(undefined, 'b')).toThrow();
                });

                test('should throw when the pattern is null', () => {
                    expect(() => CommonUtil.createResolverDefinition(null, 'b')).toThrow();
                });

                test('should throw when the pattern is an object', () => {
                    expect(() => CommonUtil.createResolverDefinition({}, 'b')).toThrow();
                });

                test('should throw when the pattern is a boolean', () => {
                    expect(() => CommonUtil.createResolverDefinition(true, 'b')).toThrow();
                });

                test('should throw when the pattern is a number', () => {
                    expect(() => CommonUtil.createResolverDefinition(3, 'b')).toThrow();
                });

            });

            describe('normalizeResolverDefinition()', () => {

                test('should create a resolver definition from an object with a pattern and a replacement', () => {
                    expect(CommonUtil.normalizeResolverDefinition({pattern: 'a', replacement: 'b'})).toEqual({pattern: 'a', replacement: 'b'});
                });

                test('should create a resolver definition from a keyed object', () => {
                    expect(CommonUtil.normalizeResolverDefinition('a', 'b')).toEqual({pattern: 'a', replacement: 'b'});
                });

            });

            describe('flattenMap', () => {

                describe('Simple Map', () => {

                    var map = {
                        firstLevelString: 'first',
                        firstLevelNumber: 1,
                        firstLevelBoolean: true,
                        firstLevelArray: ['one', 2, true],
                    };

                    it('should flatten an object', () => {
                        expect(CommonUtil.flattenMap(map)).toEqual({
                            ['firstLevelString']: 'first',
                            ['firstLevelNumber']: 1,
                            ['firstLevelBoolean']: true,
                            ['firstLevelArray.0']: 'one',
                            ['firstLevelArray.1']: 2,
                            ['firstLevelArray.2']: true
                        });
                    });

                    it('should remove functions when flattening', () => {
                        expect(CommonUtil.flattenMap({fn: ()=>{}})).toEqual({});
                    });

                });

                describe('Complex Map', () => {

                    var map = {
                        firstLevelString: 'first',
                        firstLevelNumber: 1,
                        firstLevelBoolean: true,
                        firstLevelArray: ['one', 2, true],
                        firstLevelObject: {
                            secondLevelString: 'second',
                            secondLevelNumber: 2,
                            secondLevelBoolean: true,
                            secondLevelArray: ['two', 3, true],
                            secondLevelObject: {
                                thirdLevelString: 'third',
                                thirdLevelNumber: 3,
                                thirdLevelBoolean: true,
                                thirdLevelArray: ['three', 4, true, {arrayKey: 'arrayValue'}],
                            }
                        }
                    };

                    it('should flatten an object', () => {
                        expect(CommonUtil.flattenMap(map)).toEqual({
                            ['firstLevelString']: 'first',
                            ['firstLevelNumber']: 1,
                            ['firstLevelBoolean']: true,
                            ['firstLevelArray.0']: 'one',
                            ['firstLevelArray.1']: 2,
                            ['firstLevelArray.2']: true,
                            ['firstLevelObject.secondLevelString']: 'second',
                            ['firstLevelObject.secondLevelNumber']: 2,
                            ['firstLevelObject.secondLevelBoolean']: true,
                            ['firstLevelObject.secondLevelArray.0']: 'two',
                            ['firstLevelObject.secondLevelArray.1']: 3,
                            ['firstLevelObject.secondLevelArray.2']: true,
                            ['firstLevelObject.secondLevelObject.thirdLevelString']: 'third',
                            ['firstLevelObject.secondLevelObject.thirdLevelNumber']: 3,
                            ['firstLevelObject.secondLevelObject.thirdLevelBoolean']: true,
                            ['firstLevelObject.secondLevelObject.thirdLevelArray.0']: 'three',
                            ['firstLevelObject.secondLevelObject.thirdLevelArray.1']: 4,
                            ['firstLevelObject.secondLevelObject.thirdLevelArray.2']: true,
                            ['firstLevelObject.secondLevelObject.thirdLevelArray.3.arrayKey']: 'arrayValue',
                        });
                    });

                });

            });
        });

    });

})();
