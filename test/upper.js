var test = require("tape").test

var level = require("level-test")()
var db = level("wrap")

var wrap = require("../")

test("wrap", function (t) {
  t.plan(9)

  function Upper() {
    this.type = "upper"
    this.unique = false
  }
  Upper.prototype.install = function (db, parent) {
    db.put = function (key, value, cb) {
      t.ok(1, "Wrapped function called")
      parent.put(key.toUpperCase(), value, cb)
    }

    db.get = function (key, cb) {
      t.ok(1, "Wrapped function called")
      parent.get(key.toUpperCase(), cb)
    }
  }

  var wrapped = wrap(db, new Upper())

  t.notOk(db.layers, "Parent not wrapped")
  t.deepEquals(wrapped.layers, ["upper"], "Layer was added")

  wrapped.put("a", "b", function () {
    wrapped.get("a", function (e, d) {
      t.notOk(e, "no error here")
      t.equals(d, "b", "Data was saved and is gettable as lower-case")
      db.get("a", function (e, d) {
        t.ok(e, "Didn't find key by untransformed name")
        db.get("A", function (e, d) {
          t.notOk(e, "no error this time")
          t.equals(d, "b", "Can access data from parent if we manually transform")
        })
      })
    })
  })
})
