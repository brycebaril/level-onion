var test = require("tape").test

var level = require("level-test")()
var db = level("wrap")

var wrap = require("../")

test("wrap", function (t) {
  t.plan(8)

  function Upper() {
    this.type = "upper"
    this.unique = false
  }
  Upper.prototype.install = function (db, parent) {
    db.get = function (key, cb) {
      t.ok(1, "Wrapped function called")
      parent.get(key.toUpperCase(), cb)
    }

    // TODO options override...
    function Batch() {
      this.ops = []
    }
    Batch.prototype.put = function (key, value, options) {
      // TODO ignoring options...
      this.ops.push({type: "put", key: key, value: value})
      return this
    }
    Batch.prototype.del = function () {
      // TODO ignoring options...
      this.ops.push({type: "del", key: key, value: value})
      return this
    }
    Batch.prototype.clear = function () {
      this.ops = []
      return this
    }
    Batch.prototype.write = function (cb) {
      db.batch(this.ops, cb)
    }

    db.batch = function (arr, options, cb) {
      if (!arguments.length) return new Batch()
      var transformed = arr.map(function (e) {
        e.key = e.key.toUpperCase()
        return e
      })
      parent.batch(transformed, options, cb)
    }
  }

  var wrapped = wrap(db, new Upper())

  t.notOk(db.layers, "Parent not wrapped")
  t.deepEquals(wrapped.layers, ["upper"], "Layer was added")

  wrapped.batch()
    .put("a", "b")
    .put("z", "y")
    .write(function () {
      wrapped.get("a", function (e, d) {
        t.notOk(e, "no error here")
        t.equals(d, "b", "Data was saved and is gettable as lower-case")
        db.get("a", function (e, d) {
          t.ok(e, "Didn't find key by untransformed name")
          db.get("Z", function (e, d) {
            t.notOk(e, "no error this time")
            t.equals(d, "y", "Can access data from parent if we manually transform")
          })
        })
      })
    })
})
