/**
 * These snapshot tests are used to detect whether the generated hashes are consistent.
 * If not, then this should result in a major version bump.
 */
import jsonHash from '../index';

const hex = {
	md5: /^[0-9a-f]{32}$/,
	sha1: /^[0-9a-f]{40}$/,
	sha256: /^[0-9a-f]{64}$/,
};

describe('Snapshots', () => {
	// Changing the order of the elements will cause the snapshot tests to fail!
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
		['foo', 'bar']
	];

	const specials = [
		{map: new Map<any,any>([[1, 2], [{}, []]])},
		{set: new Set([1,2, {}, [], new Map()])}
	];


	const all = [
		...primitives,
		...objects,
		...specials
	];


	for (let item of all) {
		test('hash snapshot (default options)', () => {
			expect(jsonHash(item)).toMatchSnapshot();
		});


		test('hash snapshot (algorithm: none)', () => {
			const string = jsonHash(item, {algorithm: 'none'});

			const parsed = JSON.parse(string);

			expect(string).toMatchSnapshot();
			// expect(parsed).toEqual(item);
		});


		test('hash snapshot (algorithm: md5)', () => {
			const string = jsonHash(item, {algorithm: 'md5'});

			expect(string).toMatch(hex.md5);
			expect(string).toMatchSnapshot();
		});


		test('hash snapshot (algorithm: sha1)', () => {
			const string = jsonHash(item, {algorithm: 'sha1'});

			expect(string).toMatch(hex.sha1);
			expect(string).toMatchSnapshot();
		});


		test('hash snapshot (algorithm: sha256)', () => {
			const string = jsonHash(item, {algorithm: 'sha256'});

			expect(string).toMatch(hex.sha256);
			expect(string).toMatchSnapshot();
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