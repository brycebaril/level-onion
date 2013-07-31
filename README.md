level-onion
===========

[![NPM](https://nodei.co/npm/level-onion.png)](https://nodei.co/npm/level-onion/)

Extend a [levelup](http://npm.im/levelup) instance in layers, like an onion.

Each layer you add can expose new functionality or modify functionality of inner layers, or you can bypass the layers by using the inner unmodified layers.

_WARNING_ This is currently experimental, and primarily a proof-of-concept. There are no guarantees that this will be a best practice for working with levelup, or be adopted by any significant portion of the levelup ecosystem.

Pros: Simple & low impact.

Cons: I'm not exactly thrilled with the convention it requires wrapping modules to comply with.

---

Example: case-insensitive keys:

Create a wrapping layer:

```javascript
  function Upper() {
    // Required
    this.type = "upper"
    // Default false, if true it will prevent you from double-wrapping with this wrapper.
    this.unique = false
  }

  // Requires an install method that takes the wrapped db and the parent it is wrapping
  Upper.prototype.install = function (db, parent) {
    db.put = function (key, value, cb) {
      parent.put(key.toUpperCase(), value, cb)
    }

    db.get = function (key, cb) {
      parent.get(key.toUpperCase(), cb)
    }

    // ... etc.
  }
```

Wrap a levelup instance with your wrapping layer:

```javascript
var level = require("level")
var wrap = require("level-onion")

var ldb = level("/tmp/db")
var db = wrap(db, new Upper())
// ldb remains intact and unmodified
// db now has the wrapper installed
```
