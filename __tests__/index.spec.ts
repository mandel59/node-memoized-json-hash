import jsonHash from '../index';


describe('hash', function () {

	test('throws when nothing to hash', () => {
		expect(jsonHash).toThrowError('no data');
	});


	test('throws when unknown algorithm specified', () => {
		const opts: any = {algorithm: 'shalala'};
		expect(() => jsonHash({}, opts)).toThrowError('not supported');
	});

	// it('throws when passed an invalid options', function () {
	// 	assert.throws(function () {
	// 		jsonHash({foo: 'bar'}, {algorithm: 'shalala'} as any);
	// 	}, 'bad algorithm');
	// 	assert.throws(function () {
	// 		jsonHash({foo: 'bar'}, {encoding: 'base16'} as any);
	// 	}, 'bad encoding');
	// });

	describe('objects', () => {
		test('hashes identical objects with different key ordering', function () {
			const hash1 = jsonHash({foo: 'bar', bar: 'baz'});
			const hash2 = jsonHash({bar: 'baz', foo: 'bar'});
			const hash3 = jsonHash({bar: 'foo', foo: 'baz'});

			expect(hash1).toBe(hash2);
			expect(hash1).not.toBe(hash3);
		});


		test('nested object values are hashed', function () {
			const hash1 = jsonHash({foo: {bar: true, bax: 1}});
			const hash2 = jsonHash({foo: {bar: true, bax: 1}});
			const hash3 = jsonHash({foo: {bar: false, bax: 1}});

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
		// 	assert.notEqual(jsonHash(hash1), jsonHash(hash2), "order of recursive objects should matter");
		//
		// 	expect(jsonHash(hash1)).toMatchSnapshot();
		// 	expect(jsonHash(hash2)).toMatchSnapshot();
		// });


		test('arrays and objects should not produce identical hashes', function () {
			const hash1 = jsonHash({foo: 'bar'});
			const hash2 = jsonHash(['foo', 'bar']);

			expect(hash1).not.toBe(hash2);
		});


		test('handles objects with undefined fields', () => {
			const o = {defined: true, not_defined: undefined};

			const json1 = jsonHash(o, {algorithm: 'none'});
			const json2 = JSON.stringify(o);

			expect(json1).toBe(json2);
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
			const hash1 = jsonHash('\u03c3'); // cf 83 in utf8
			const hash2 = jsonHash('\u01c3'); // c7 83 in utf8

			expect(hash1).not.toBe(hash2);
		});


		test('null and "null" string produce different hashes', function () {
			const hash1 = jsonHash({foo: null});
			const hash2 = jsonHash({foo: 'null'});

			expect(hash1).not.toEqual(hash2);
		});
	});


	describe('numbers', () => {
		test('1 and "1" string produce different hashes', function () {
			const hash1 = jsonHash('1');
			const hash2 = jsonHash(1);

			expect(hash1).not.toEqual(hash2);
		});
	});


	describe('memoization', () => {
		test('cache does not mess things up', () => {
			const o1 = {};
			const o2 = {a: 1};
			const o3 = {b: 2, a: [1, 2, 3]};

			const hash1 = jsonHash({o1, o2, o3});
			const hash2 = jsonHash({o1, o2, o3});
			const hash3 = jsonHash({o3, o2, o1: {}});
			const hash4 = jsonHash({o2: {a: 1}, o3: {a: [1, 2, 3], b: 2}, o1: {}});

			expect(hash1).toBe(hash2);
			expect(hash2).toBe(hash3);
			expect(hash3).toBe(hash4);
		});

	});
});

