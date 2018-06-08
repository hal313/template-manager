import { TemplateManager } from '../src/TemplateManager';

(() => {

    describe('Template Manager', () => {
        let templateManager;

        describe('Lifecycle', () => {

            test('TemplateManager should exist as a global', () => {
                expect(TemplateManager).toEqual(expect.any(Function));
            });

        });

        describe('API', () => {

            beforeEach(() => {
                templateManager = new TemplateManager();
            });

            describe('add()', () => {

                describe('Basic Functionality', () => {
                    var templateContent = {
                        nullContent: null,
                        emptyContent: '',
                        regularContent: 'this is ${resolver} regular template'
                    };

                    test('should have a .add() function', () => {
                        expect(templateManager.add).toEqual(expect.any(Function));
                    });

                    test('should throw an error when an undefined template name is used', () => {
                        expect(() => {
                            templateManager.add(undefined, templateContent.regularContent);
                        }).toThrow(Error);
                    });

                    test('should throw an error when a null template name is used', () => {
                        expect(() => {
                            templateManager.add(null, templateContent.regularContent);
                        }).toThrow(Error);
                    });

                    test('should throw an error when an empty template name is used', () => {
                        expect(() => {
                            templateManager.add('', templateContent.regularContent);
                        }).toThrow(Error);
                    });

                    test('should throw an error when an empty template name is used', () => {
                        expect(() => {
                            templateManager.add('            ', templateContent.regularContent);
                        }).toThrow(Error);
                    });

                    test('should throw an error when a duplicate template name is used', () => {
                        templateManager.add('test', 'content');
                        expect(() => templateManager.add('test', 'content')).toThrow();
                    });

                    test('should throw when an undefined template is passed in', () => {
                        expect(() => templateManager.add('test', undefined)).toThrow();
                    });

                    test('should throw when an null template is passed in', () => {
                        expect(() => templateManager.add('test', null)).toThrow();
                    });

                    test('should add a template', () => {
                        templateManager.add('test', 'content');
                        expect(templateManager.hasTemplate('test')).toBeTruthy();
                    });

                    test('should add a template when the template is the empty string', () => {
                        templateManager.add('test', '');
                        expect(templateManager.hasTemplate('test')).toBeTruthy();
                    });

                });

            });

            describe('get()', () => {

                test('should have a .get() function', () => {
                    expect(templateManager.get).toEqual(expect.any(Function));
                });

                test('should throw when the specified name is undefined', () => {
                    expect(() => templateManager.get(undefined)).toThrow();
                });

                test('should throw when the specified name is null', () => {
                    expect(() => templateManager.get(null)).toThrow();
                });

                test('should throw when the specified name is empty', () => {
                    expect(() => templateManager.get('')).toThrow();
                });

                test('should throw when the specified name is empty', () => {
                    expect(() => templateManager.get('      ')).toThrow();
                });
            });

            describe('load()', () => {

                test('should have a .load() function', () => {
                    expect(templateManager.load).toEqual(expect.any(Function));
                });

                test('should throw an error when loading templates with no name', () => {
                    document.body.innerHTML = `
                        <script type="text/x-template-manager">
                            This is a template
                        </script >`
                        ;
                    expect(new TemplateManager().load).toThrow();

                });

                test('should load scripts from the HTML page', () => {
                    var embeddedTemplateName = 'test-template',
                        embeddedTemplateContent = 'This is a template';

                    document.body.innerHTML = `
                        <script type="text/x-template-manager" data-name="${embeddedTemplateName}">
                            ${embeddedTemplateContent}
                        </script >`
                    ;

                    templateManager.load();
                    expect(templateManager.get(embeddedTemplateName).raw()).toBe(embeddedTemplateContent);
                });

            });

            describe('remove()', () => {

                test('should have a .remove() function', () => {
                    expect(templateManager.remove).toEqual(expect.any(Function));
                });

                test('should throw when undefined is passed in as the template name', () => {
                    expect(() => templateManager.remove(undefined)).toThrow();
                });

                test('should throw when null is passed in as the template name', () => {
                    expect(() => templateManager.remove(null)).toThrow();
                });

                test('should throw when the empty string is passed in as the template name', () => {
                    expect(() => templateManager.remove('')).toThrow();
                });

                test('should throw when the empty string is passed in as the template name', () => {
                    expect(() => templateManager.remove('       ')).toThrow();
                });

                test('should remove a template', () => {
                    templateManager.add('test', '');
                    expect(templateManager.getTemplateNames().length).toBe(1);
                    templateManager.remove('test');
                    expect(() => templateManager.get('test')).toThrow();
                });

            });

            describe('hasTemplate()', () => {

                test('should exist as a function', () => {
                    expect(templateManager.hasTemplate).toEqual(expect.any(Function));
                });

                test('should throw when undefined is passed in as the template name', () => {
                    expect(() => templateManager.hasTemplate(undefined)).toThrow();
                });

                test('should throw when null is passed in as the template name', () => {
                    expect(() => templateManager.hasTemplate(null)).toThrow();
                });

                test('should throw when the empty string is passed in as the template name', () => {
                    expect(() => templateManager.hasTemplate('')).toThrow();
                });

                test('should throw when the empty string is passed in as the template name', () => {
                    expect(() => templateManager.hasTemplate('       ')).toThrow();
                });

                test('should return false when there is no template with the specified name', () => {
                    templateManager.empty();
                    expect(templateManager.hasTemplate('test')).toBeFalsy();
                });

                test('should return true when there is a template with the specified name', () => {
                    templateManager.empty();
                    templateManager.add('test', 'content');
                    expect(templateManager.hasTemplate('test')).toBeTruthy();
                });

            });

            describe('empty()', () => {

                test('should exist as a function', () => {
                    expect(templateManager.empty).toEqual(expect.any(Function));
                });

                test('should empty all templates', () => {
                    templateManager.empty();
                    expect(templateManager.getTemplateNames().length).toBe(0);
                    templateManager.add('test', 'content');
                    expect(templateManager.getTemplateNames().length).not.toBe(0);
                });

            });

            describe('getTemplateNames()', () => {

                test('should exist as a function', () => {
                    expect(templateManager.getTemplateNames).toEqual(expect.any(Function));
                });

                test('should return the template names', () => {
                    var templates;
                    templateManager.empty();

                    templateManager.add('test', 'test template content');
                    templates = templateManager.getTemplateNames();
                    expect(templates.length).toEqual(1);
                    expect(templates[0]).toEqual('test');

                    templateManager.add('test2', 'test template content');
                    templates = templateManager.getTemplateNames();
                    expect(templates.length).toEqual(2);
                    expect(templates[0]).toEqual('test');
                    expect(templates[1]).toEqual('test2');
                });

            });


        });

        describe('template.raw()', () => {
            var templateName = 'template',
                templateContent = 'this is ${resolved}';

            beforeEach(() => {
                templateManager = new TemplateManager();
            });

            test('should have a raw() function on the template', () => {
                var template = templateManager.add(templateName, templateContent);
                expect(template.raw).toEqual(expect.any(Function));
            });

            test('should return the raw template', () => {
                var template = templateManager.add(templateName, templateContent);
                expect(template.raw()).toEqual(templateContent);
            });

        });

        describe('template.process()', () => {
            var templateName = 'template',
                templateContent = 'this is ${resolved}',
                resolved = 'this is resolved',
                resolverMap = {resolved: 'resolved'};

            beforeEach(() => {
                templateManager = new TemplateManager();
            });

            test('should have a process() function on the template', () => {
                var template = templateManager.add(templateName, templateContent);
                expect(template.process).toEqual(expect.any(Function));
            });

            test('should return the processed template', () => {
                var template = templateManager.add(templateName, templateContent);
                expect(template.process(resolverMap)).toEqual(resolved);
            });

            test('should return the processed template (classic notation)', () => {
                var template = templateManager.add(templateName, templateContent);
                expect(template.process([{pattern: 'resolved', replacement: 'resolved'}])).toEqual(resolved);
            });

            test('should return the processed template (shortcut notation)', () => {
                var template = templateManager.add(templateName, templateContent);
                expect(template.process(resolverMap)).toEqual(resolved);
            });

            test('should use the default resolver map', () => {
                var templateManager = new TemplateManager(resolverMap),
                    template = templateManager.add(templateName, templateContent);

                expect(template.process()).toEqual(resolved);
            });

        });

    });

})();
