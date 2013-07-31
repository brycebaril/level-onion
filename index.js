module.exports = wrap

function wrap(db, wrapper) {
  if (!db || !wrapper) throw new Error("You must provide a db and a wrapping layer!")
  if (!wrapper.type || !typeof wrapper.install == "function")
    throw new Error("Your wrapper must supply .type (string) and a .install(db, parent) function")

  var layers = db.layers || []

  if (wrapper.unique) {
    if (layers.indexOf(wrapper.type) >= 0) return db
  }

  var o = Object.create(db)

  wrapper.install(o, db)

  layers.push(wrapper.type)
  o.layers = layers

  return o
}
