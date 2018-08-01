import jsonHash from '../index';
import objectHash from '../index';

const validSha1 = /^[0-9a-f]{40}$/i;

describe('hash', function () {

	test.skip('removes undefined fields', () => {
	});

	test('throws when nothing to hash', () => {
		expect(jsonHash).toThrowError('no data');
	});


	test('throws when unknown algorithm specified', () => {
		const opts: any = {algorithm: 'shalala'};
		expect(() => jsonHash({}, opts)).toThrowError('not supported');
	});

	// it('throws when passed an invalid options', function () {
	// 	assert.throws(function () {
	// 		objectHash({foo: 'bar'}, {algorithm: 'shalala'} as any);
	// 	}, 'bad algorithm');
	// 	assert.throws(function () {
	// 		objectHash({foo: 'bar'}, {encoding: 'base16'} as any);
	// 	}, 'bad encoding');
	// });

	describe('objects', () => {
		test('hashes a simple object', function () {
			const string = jsonHash({foo: 'bar', bar: 'baz'});

			expect(string).toMatch(validSha1);
		});


		test('hashes identical objects with different key ordering', function () {
			const hash1 = objectHash({foo: 'bar', bar: 'baz'});
			const hash2 = objectHash({bar: 'baz', foo: 'bar'});
			const hash3 = objectHash({bar: 'foo', foo: 'baz'});

			expect(hash1).toBe(hash2);
			expect(hash1).not.toBe(hash3);
		});


		test('nested object values are hashed', function () {
			const hash1 = objectHash({foo: {bar: true, bax: 1}});
			const hash2 = objectHash({foo: {bar: true, bax: 1}});
			const hash3 = objectHash({foo: {bar: false, bax: 1}});

			expect(hash1).toBe(hash2);
			expect(hash1).not.toBe(hash3);
		});


		test('recursive objects do not blow up stack', function () {
			const obj: any = {foo: 'bar'};
			obj.recursive = obj;

			expect(() => jsonHash(obj, {cycles: true})).not.toThrowError();
		});


		// it("recursive handling tracks identity", function () {
		// 	const hash1: any = {k1: {k: 'v'}, k2: {k: 'k2'}};
		// 	hash1.k1.r1 = hash1.k1;
		// 	hash1.k2.r2 = hash1.k2;
		// 	const hash2: any = {k1: {k: 'v'}, k2: {k: 'k2'}};
		// 	hash2.k1.r1 = hash2.k2;
		// 	hash2.k2.r2 = hash2.k1;
		// 	assert.notEqual(objectHash(hash1), objectHash(hash2), "order of recursive objects should matter");
		//
		// 	expect(objectHash(hash1)).toMatchSnapshot();
		// 	expect(objectHash(hash2)).toMatchSnapshot();
		// });


		test('arrays and objects should not produce identical hashes', function () {
			const hash1 = objectHash({foo: 'bar'});
			const hash2 = objectHash(['foo', 'bar']);

			expect(hash1).not.toBe(hash2);
		});
	});


	describe('arrays', () => {
		test('different array orders are unique', function () {
			const hash1 = jsonHash({foo: ['bar', 'baz'], bax: true});
			const hash2 = jsonHash({foo: ['baz', 'bar'], bax: true});

			expect(hash1).not.toBe(hash2);
		});


		test('array of nested object values are hashed', function () {
			const hash1 = jsonHash({foo: [{bar: true, bax: 1}, {bar: false, bax: 2}]});
			const hash2 = jsonHash({foo: [{bar: true, bax: 1}, {bar: false, bax: 2}]});
			const hash3 = jsonHash({foo: [{bar: false, bax: 2}]});

			expect(hash1).toBe(hash2);
			expect(hash1).not.toBe(hash3);
		});


		test('recursive arrays do not blow up stack', function () {
			const hash1: any = ['foo', 'bar'];
			hash1.push(hash1);

			expect(() => jsonHash(hash1, {cycles: true})).not.toThrowError();
		});
	});


	describe('strings', () => {
		test('different strings with similar utf8 encodings should produce different hashes', function () {
			const hash1 = objectHash('\u03c3'); // cf 83 in utf8
			const hash2 = objectHash('\u01c3'); // c7 83 in utf8

			expect(hash1).not.toBe(hash2);
		});


		test("null and 'null' string produce different hashes", function () {
			const hash1 = objectHash({foo: null});
			const hash2 = objectHash({foo: 'null'});

			expect(hash1).not.toEqual(hash2);
		});
	});
});

