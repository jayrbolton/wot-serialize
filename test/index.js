const ident = require('../../wot-identity')
const serialize = require('../')
const test = require('tape')

test('save and load a user to/from disk', t => {
  const pass = 'aesrntearsntearstn'
  ident.createUser(pass, {name: 'pb'}, function (err, user) {
    if (err) throw err
    serialize.saveUser(user, '/tmp/uzr', function (err) {
      if (err) throw err
      serialize.loadUser(pass, '/tmp/uzr', function (err, loadedUser) {
        if (err) throw err
        t.deepEqual(loadedUser.stamp_locked, user.stamp_locked, 'loads the locked stamp')
        t.deepEqual(loadedUser.key_locked, user.key_locked, 'loads the locked key')
        t.deepEqual(loadedUser.stamp, user.stamp, 'unlocks the stamp')
        t.deepEqual(loadedUser.key, user.key, 'unlocks the key')
        t.deepEqual(loadedUser.imprint, user.imprint, 'loads the imprint')
        t.deepEqual(loadedUser.lock, user.lock, 'loads the lock')
        t.deepEqual(loadedUser.cert, user.cert, 'loads cert')
        t.deepEqual(loadedUser._salt, user._salt, 'loads salt')
        t.end()
      })
    })
  })
})

test('cant load with invalid pass', t => {
  const pass = 'aesrntearsntearstn'
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
