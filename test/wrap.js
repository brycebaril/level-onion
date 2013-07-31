var test = require("tape").test

var level = require("level-test")()
var db = level("wrap")

var wrap = require("../")

test("wrap", function (t) {
  function Wrapper() {
    this.type = "test"
    this.unique = true
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

  var doubleWrapped = wrap(wrapped, new Wrapper())
  t.deepEquals(wrapped, doubleWrapped, "Unique flag prevents double wrapping for this wrapper")

  t.notOk(db.layers, "Parent not wrapped")
  t.deepEquals(wrapped.layers, ["test"], "Layer was added")

  wrapped.put("a", "b", function () {
    wrapped.get("a", function (e, d) {
      t.equals(d, "b", "Data was saved and is gettable")
      db.del("a", function () {
        t.end()
      })
    })
  })
})
