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
	const arr = [
		10,
		1.1,
		NaN,
		Infinity,
		true,
		false,
		null,
		'a string',
		{},
		{foo: 'bar', bar: 'baz'},
		{foo: {bar: true, bax: 1}},
		{foo: ['bar', 'baz'], bax: true},
		['foo', 'bar']
	];


	for (let item of arr) {
		test('hash snapshot (default options)', () => {
			expect(jsonHash(item)).toMatchSnapshot();
		});
	}


	for (let item of arr) {
		test('hash snapshot (algorithm: md5)', () => {
			const string = jsonHash(item, {algorithm: 'md5'});

			expect(string).toMatch(hex.md5);
			expect(string).toMatchSnapshot();
		});
	}


	for (let item of arr) {
		test('hash snapshot (algorithm: sha1)', () => {
			const string = jsonHash(item, {algorithm: 'sha1'});

			expect(string).toMatch(hex.sha1);
			expect(string).toMatchSnapshot();
		});
	}


	for (let item of arr) {
		test('hash snapshot (algorithm: sha256)', () => {
			const string = jsonHash(item, {algorithm: 'sha256'});

			expect(string).toMatch(hex.sha256);
			expect(string).toMatchSnapshot();
		});
	}
});