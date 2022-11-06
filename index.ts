import { createHash } from 'crypto';

export type Algorithm = 'none' | 'sha1' | 'sha256' | 'sha512' | 'md5';

export interface Options {
	/**
	 * Which hashing algorithm to use. Specify 'none' to return a deterministic JSON string.
	 *
	 * Default: 'sha1'
	 */
	algorithm: Algorithm;

	/**
	 * Whether to allow recursive structures.
	 *
	 * Default: false
	 */
	cycles: boolean;

	/**
	 * Whether to use the cache (memoization).
	 *
	 * Default: true
	 */
	useCache: boolean;
}

export class MemoizedJsonHash {
	readonly algorithm: Algorithm;
	readonly cycles: boolean;
	readonly useCache: boolean;
	_cache: Partial<{ [key in Algorithm]: WeakMap<object, string> }> = {};
	constructor(opts: Partial<Options> = {}) {
		this.algorithm = opts.algorithm || 'sha1';
		this.cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
		this.useCache = (typeof opts.useCache === 'boolean') ? opts.useCache : true;
	}
	cache(algorithm: Options['algorithm']) {
		let c = this._cache[algorithm];
		if (!c) c = this._cache[algorithm] = new WeakMap<object, string>();
		return c;
	}
	hash(data: any, opts: Partial<Options> = {}) {
		if (data === undefined) throw new Error('no data argument');

		const algorithm = opts.algorithm || this.algorithm;
		const cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : this.cycles;
		const useCache = (typeof opts.useCache === 'boolean') ? opts.useCache : this.cache;

		const seen = new Set();

		const self = this;
		const json = (function stringify(node: any): string | undefined {
			// Exit early for primitives
			if (node === undefined) return;
			if (node === null) return 'null';

			// If the given object implements a toJSON function, use its return value for further processing
			if (node.toJSON && typeof node.toJSON === 'function') {
				node = node.toJSON();
			}

			// Important to check for this *after* invoking the toJSON() function, because that can result in a primitive
			if (typeof node !== 'object') return JSON.stringify(node);

			// Bypass the cache if the option was set
			if (!useCache) return stringifyObject(node);

			const map = self.cache(algorithm);
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
					let out = '';
					for (let i = 0; i < node.length; i++) {
						if (out) out += ',';
						out += stringify(node[i]) || 'null';
					}
					return '[' + out + ']';
				}

				const keys = Object.keys(node).sort();
				let out = '';
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					const value = stringify(node[key]);

					// Skip undefined entries
					if (!value) continue;

					if (out) out += ',';
					out += JSON.stringify(key) + ':' + value;
				}
				return '{' + out + '}';
			}
		}
		)(data) as string; // Safe to cast because a check for undefined is done before stringify is called

		if (algorithm === 'none') return json;
		const stream = createHash(algorithm);
		stream.update(json);
		return stream.digest('hex');
	}
}

let _cache: MemoizedJsonHash | undefined
export default function memoizedJsonHash(data: any, opts: Partial<Options> = {}): string {
	if (_cache == null) _cache = new MemoizedJsonHash();
	return _cache.hash(data, opts);
};
