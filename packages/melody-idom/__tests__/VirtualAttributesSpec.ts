/**
 * Copyright 2015 The Incremental DOM Authors.
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    patch,
    elementOpen,
    elementOpenStart,
    elementOpenEnd,
    elementClose,
    attr,
} from '../src';

describe('virtual attribute updates', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('for conditional attributes', () => {
        function render(obj) {
            elementOpenStart('div', null, null, 'data-static', 'world');
            if (obj.key) {
                attr('data-expanded', obj.key);
            }
            elementOpenEnd();
            elementClose('div');
        }

        it('should be present when specified', () => {
            patch(container, () =>
                render({
                    key: 'hello',
                })
            );
            const el = container.childNodes[0];

            expect(el.getAttribute('data-expanded')).toEqual('hello');
        });

        it('should be not present when not specified', () => {
            patch(container, () =>
                render({
                    key: false,
                })
            );
            const el = container.childNodes[0];

            expect(el.getAttribute('data-expanded')).toBeNull();
        });

        it('should update the DOM when they change', () => {
            patch(container, () =>
                render({
                    key: 'foo',
                })
            );
            patch(container, () =>
                render({
                    key: 'bar',
                })
            );
            const el = container.childNodes[0];

            expect(el.getAttribute('data-expanded')).toEqual('bar');
        });

        it('should include static attributes', function() {
            patch(container, () =>
                render({
                    key: false,
                })
            );
            const el = container.childNodes[0];
            expect(el.getAttribute('data-static')).toEqual('world');
        });

        it('should throw when defined outside virtual attributes element', () => {
            const error =
                'attr() can only be called after calling elementOpenStart().';
            expect(() => {
                patch(container, () => {
                    attr('data-expanded', true);
                });
            }).toThrowError(new Error(error));
        });
    });

    it('should throw when a virtual attributes element is unclosed', () => {
        const error =
            'elementOpenEnd() must be called after calling elementOpenStart().';
        expect(() => {
            patch(container, () => {
                elementOpenStart('div');
            });
        }).toThrowError(new Error(error));
    });

    it('should throw when virtual attributes element is closed without being opened', () => {
        const error =
            'elementOpenEnd() can only be called after calling elementOpenStart().';
        expect(() => {
            patch(container, () => {
                elementOpenEnd('div');
            });
        }).toThrowError(new Error(error));
    });

    it('should throw when opening an element inside a virtual attributes element', () => {
        const error =
            'elementOpen() can not be called between elementOpenStart() and elementOpenEnd().';
        expect(() => {
            patch(container, () => {
                elementOpenStart('div');
                elementOpen('div');
            });
        }).toThrowError(new Error(error));
    });

    it('should throw when opening a virtual attributes element inside a virtual attributes element', () => {
        const error =
            'elementOpenStart() can not be called between elementOpenStart() and elementOpenEnd().';
        expect(() => {
            patch(container, () => {
                elementOpenStart('div');
                elementOpenStart('div');
            });
        }).toThrowError(new Error(error));
    });

    it('should throw when closing an element inside a virtual attributes element', () => {
        const error =
            'elementClose() can not be called between elementOpenStart() and elementOpenEnd().';
        expect(() => {
            patch(container, () => {
                elementOpenStart('div');
                elementClose('div');
            });
        }).toThrowError(new Error(error));
    });
});
