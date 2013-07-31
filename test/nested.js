var test = require("tape").test

var level = require("level-test")()
var db = level("wrap")

var wrap = require("../")

test("nested", function (t) {
  t.plan(5)

  function Wrapper() {
    this.type = "test"
    this.unique = false
  }
  Wrapper.prototype.install = function (db, parent) {
    db.put = function (key, value, cb) {
      t.ok(1, "Wrapped function called")
      parent.put(key, value, cb)
    }

    db.del = function (key, cb) {
      t.fail(1, "Not intending to call wrapped version in test")
      parent.del(key, cb)
    }
  }

  var wrapped = wrap(db, new Wrapper())

  var nested = wrap(wrapped, new Wrapper())

  t.notOk(db.layers, "Parent not wrapped")
  t.deepEquals(nested.layers, ["test", "test"], "Layer was added")

  nested.put("a", "b", function () {
    nested.get("a", function (e, d) {
      t.equals(d, "b", "Data was saved and is gettable")
      db.del("a", function () {
        t.end()
      })
    })
  })
})
