is-type-of
==========

complete type checking for node, extend [core-util-is](https://github.com/isaacs/core-util-is)

dependencies:

- [core-util-is](https://github.com/isaacs/core-util-is)
- [is-stream](https://github.com/rvagg/isstream)
- [is-class](https://github.com/miguelmota/is-class)

## Install

```
npm install is-type-of
```

## Example

```
var is = require('is-type-of');

is.array([1]); // => true
is.primitive(true); // => true
is.primitive({}); // => false
is.generatorFunction(function * () {}); // => true
is.long(Math.pow(2, 33)); // => true
is.double(0); // => false
```

## API

### From [core-util-is](https://github.com/isaacs/core-util-is)

#### is.array(arr)

#### is.boolean(bool)

#### is.null(null)

#### is.nullOrUndefined(null)

#### is.number(num)

#### is.string(str)

#### is.symbol(sym)

#### is.undefined(undef)

#### is.regExp(reg)

#### is.object(obj)

#### is.date(date)

#### is.error(err)

#### is.function(fn)

#### is.primitive(prim)

#### is.buffer(buf)

### from [is-stream](https://github.com/rvagg/isstream)

#### is.stream(stream)

#### is.readableStream(readable)

#### is.writableStream(writable)

#### is.duplexStream(duplex)

### from [is-class](https://github.com/miguelmota/is-class)

#### is.class(obj)

### Extend API

#### is.finite(num)

#### is.NaN(NaN)

#### is.generator(gen)

#### is.generatorFunction(fn)

#### is.promise(fn)

#### is.int(int)

#### is.double(double)

#### is.int32(int)

#### is.long(long)

#### is.Long(Long)

  * Support [Long](https://github.com/dcodeIO/Long.js) instance.

## License

MIT
