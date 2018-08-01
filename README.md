# memoized-json-hash

Generate hashes of serializable objects. Based on `json-stable-stringify` by [@substack](https://github.com/substack), but memoizes the intermediate strings to improve performance. This only makes sense when hashing objects that frequently contain the same objects. Furthermore, this utility assumes that the input data is immutable. In other words, the function will return wrong results if you mutate the input between invocations!

Usage:

```typescript
import jsonHash from 'memoized-json-hash'; // const jsonHash = require('memoized-json-hash').default;

const hash = jsonHash({foo: 'bar', bar: 'baz'});
// -> '7337b77ab6e6c7eb8e0ccd547591f6b926cec1e6'

// With options...

const options = {
	algorithm: 'none'
}

const json = jsonHash({foo: 'bar', bar: 'baz'}, options);
// -> '{"foo":"bar","bar":"baz"}'


interface Options {
	/**
	 * Which hashing algorithm to use. Specify 'none' to return a deterministic JSON string.
	 *
	 * Default: 'sha1'
	 */
	algorithm: 'none' | 'sha1' | 'sha256' | 'sha512' | 'md5'

	/**
	 * Whether to allow recursive structures.
	 *
	 * Default: false
	 */
	cycles: boolean,

	/**
	 * Whether to use the cache (memoization).
	 *
	 * Default: true
	 */
	cache: boolean
}
```