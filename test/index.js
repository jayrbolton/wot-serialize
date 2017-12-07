const ident = require('../../wot-identity') // TODO
const serialize = require('../')
const test = require('tape')
const crypto = require('../../wot-crypto') // TODO

test('save and load a user to/from disk', t => {
  const pass = crypto.id(8)
  ident.createUser(pass, {name: 'pb'}, function (err, user) {
    if (err) throw err
    serialize.saveUser(user, '/tmp/uzr', function (err) {
      if (err) throw err
      serialize.loadUser(pass, '/tmp/uzr', function (err, loadedUser) {
        if (err) throw err
        t.strictEqual(loadedUser.stamp_locked, user.stamp_locked, 'loads the locked stamp')
        t.strictEqual(loadedUser.key_locked, user.key_locked, 'loads the locked key')
        t.strictEqual(loadedUser.stamp, user.stamp, 'unlocks the stamp')
        t.strictEqual(loadedUser.key, user.key, 'unlocks the key')
        t.strictEqual(loadedUser.imprint, user.imprint, 'loads the imprint')
        t.strictEqual(loadedUser.lock, user.lock, 'loads the lock')
        t.strictEqual(loadedUser.cert, user.cert, 'loads cert')
        t.strictEqual(loadedUser._salt, user._salt, 'loads salt')
        t.deepEqual(loadedUser.stamped_users, user.stamped_users, 'loads stamped users')
        t.end()
      })
    })
  })
})

test('cant load with invalid pass', t => {
  const pass = crypto.id(8)
  ident.createUser(pass, {name: 'pb'}, function (err, user) {
    if (err) throw err
    serialize.saveUser(user, '/tmp/uzr', function (err) {
      if (err) throw err
      serialize.loadUser(pass + 'x', '/tmp/uzr', function (err, loadedUser) {
        t.assert(err instanceof Error, 'throws error for invalid pass')
        t.end()
      })
    })
  })
})
