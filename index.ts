import {createHash} from 'crypto';


export interface Options {
	algorithm: 'none' | 'sha1' | 'sha256' | 'sha512' | 'md5',
	cycles: boolean
}


export default function memoizedJsonHash(data: any, opts: Partial<Options> = {}): string {
	if (data === undefined) throw new Error('no data argument');

	const cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

	const algorithm = opts.algorithm || 'sha1';

	const seen = new Set();

	const json = (function stringify(node: any) {
			// Exit early for primitives
			if (node === undefined) return;
			if (node === null) return 'null';

			// If the given object implements a toJSON function, use its return value for further processing
			if (node.toJSON && typeof node.toJSON === 'function') {
				node = node.toJSON();
			}

			// Important to check for this *after* invoking the toJSON() function, because that can result in a primitive
			if (typeof node !== 'object') return JSON.stringify(node);


			const map = cache(algorithm);
			let result = map.get(node);
			if (!result) {
				result = stringifyObject(node);
				map.set(node, result);
			}
			return result;

			function stringifyObject(node: any) {
				if (seen.has(node)) {
					if (cycles) return JSON.stringify('__cycle__');
					throw new TypeError('Converting circular structure to JSON');
				} else {
					seen.add(node);
				}


				if (Array.isArray(node)) {
					const out = new Array(node.length);
					for (let i = 0; i < node.length; i++) out[i] = stringify(node[i]) || 'null';
					return '[' + out.join(',') + ']';
				}


				const keys = Object.keys(node).sort();
				const out = new Array(keys.length);
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					const value = stringify(node[key]);

					// Do not include keys that are undefined
					if (!value) continue; // TODO: This will lead to holes in the array

					out[i] = JSON.stringify(key) + ':' + value;
				}
				return '{' + out.join(',') + '}';
			}
		}
	)(data) as string; // Safe to cast because a check for undefined is done before stringify is called


	if (algorithm === 'none') return json;

	const stream = createHash(algorithm);

	stream.update(json);

	return stream.digest('hex');
};


const _cache: Partial<{[key in Options['algorithm']]: WeakMap<object, string>}> = {};//

function cache(algorithm: Options['algorithm']) {
	let c = _cache[algorithm];

	if (!c) c = _cache[algorithm] = new WeakMap<object, string>();

	return c;
}