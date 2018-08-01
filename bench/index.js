const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;
const faker = require('faker');

const crypto = require('crypto');

const objectHash = require('object-hash');
const nodeObjectHash = require('node-object-hash')();
const hashObject = require('hash-object');
const jsonHash = require('json-hash');
const stringify = require('fast-json-stable-stringify');
const memoized = require('../dist/cjs').default;


console.log('Creating fake data...');


const dataArray = [];
let dataStairs = {end: 'is near'};

for (let i = 0; i < 50; i++) {
	dataArray.push({
		name: faker.name.firstName(),
		date: new Date(),
		address: {
			city: faker.address.city(),
			streetAddress: faker.address.streetAddress(),
			country: faker.address.country()
		},
		email: [
			faker.internet.email(),
			faker.internet.email(),
			faker.internet.email(),
			faker.internet.email()
		],
		randoms: [
			faker.random.number(),
			faker.random.alphaNumeric(),
			faker.random.number(),
			faker.random.alphaNumeric(),
			faker.random.words(),
			faker.random.word()
		],
		avatars: [
			{
				number: faker.random.number(),
				avatar: faker.internet.avatar()
			}, {
				number: faker.random.number(),
				avatar: faker.internet.avatar()
			}, {
				number: faker.random.number(),
				avatar: faker.internet.avatar()
			}, {
				number: faker.random.number(),
				avatar: faker.internet.avatar()
			}
		]
	});
}
var tmp;
for (i = 0; i < 100; i++) {
	tmp = {
		data: dataStairs
	};
	dataStairs = tmp;
}

// test preparations
const jsonHashOpts = {cycles: true, crypto};
const nodeObjectHashOpts = {alg: 'sha1'};
const hashObjectOpts = {algorithm: 'sha1'};
const objectHashOpts = {algorithm: 'sha1', encoding: 'hex'};

suite
	.add('memoized-json-hash', function () {
		memoized(dataStairs);
		memoized([...dataArray]);
	})
	.add('json-hash', function () {
		jsonHash.digest(dataStairs, jsonHashOpts);
		jsonHash.digest([...dataArray], jsonHashOpts);
	})
	.add('node-object-hash', function () {
		nodeObjectHash.hash(dataStairs, nodeObjectHashOpts);
		nodeObjectHash.hash([...dataArray], nodeObjectHashOpts);
	})
	.add('hash-object', function () {
		hashObject(dataStairs, hashObjectOpts);
		hashObject([...dataArray], hashObjectOpts);
	})
	.add('object-hash', function () {
		objectHash(dataStairs, objectHashOpts);
		objectHash([...dataArray], objectHashOpts);
	})
	.add('fast-json-stable-stringify', function () {
		stringify(dataStairs);
		stringify([...dataArray]);
	})

	// add listeners
	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	// run async
	.run({'async': true});
