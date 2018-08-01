/**
 * These snapshot tests are used to detect whether the generated hashes are consistent.
 * If not, then this should result in a major version bump.
 */
import jsonHash from '../index';
import id from 'object-hash';


const hex = {
	md5: /^[0-9a-f]{32}$/,
	sha1: /^[0-9a-f]{40}$/,
	sha256: /^[0-9a-f]{64}$/,
};

describe('Snapshots', () => {
	const numbers = [
		10,
		1.1,
		NaN,
		Infinity
	];

	const primitives = [
		...numbers,
		true,
		false,
		null,
		'a string'
	];

	const objects = [
		{},
		{foo: 'bar', bar: 'baz'},
		{foo: {bar: true, bax: 1}},
		{foo: ['bar', 'baz'], bax: true},
		['foo', 'bar'],
		{defined: true, not_defined: undefined},
		{a: undefined, b: 1, c: undefined},
		{'!@"#$/\'``': 'unusual...'}
	];

	const specials = [
		{map: new Map<any,any>([[1, 2], [{}, []]])},
		{set: new Set([1,2, {}, [], new Map()])},
		[true, undefined]
	];


	const all = [
		...primitives,
		...objects,
		...specials
	];


	for (let item of all) {
		test('hash snapshot (default options)', () => {
			expect(jsonHash(item)).toMatchSnapshot(id(item));
		});


		test('hash snapshot (algorithm: none)', () => {
			const string = jsonHash(item, {algorithm: 'none'});

			expect(string).toMatchSnapshot(id(item));
		});


		test('hash snapshot (algorithm: md5)', () => {
			const string = jsonHash(item, {algorithm: 'md5'});

			expect(string).toMatch(hex.md5);
			expect(string).toMatchSnapshot(id(item));
		});


		test('hash snapshot (algorithm: sha1)', () => {
			const string = jsonHash(item, {algorithm: 'sha1'});

			expect(string).toMatch(hex.sha1);
			expect(string).toMatchSnapshot(id(item));
		});


		test('hash snapshot (algorithm: sha256)', () => {
			const string = jsonHash(item, {algorithm: 'sha256'});

			expect(string).toMatch(hex.sha256);
			expect(string).toMatchSnapshot(id(item));
		});


		test('produces valid json (algorithm: none)', () => {
			const string = jsonHash(item, {algorithm: 'none'});

			expect(() => JSON.parse(string)).not.toThrowError();
		});
	}


	for(let item of objects) {
		test( 'parsing stringified json yields original object (algorithm: none)', () => {
			const string = jsonHash(item, {algorithm: 'none'});
			const parsed = JSON.parse(string);

			expect(parsed).toEqual(item);
		});
	}
});