# wot-serialize

## saveUser(user, directory, callback)

Save the `user` to a `directory` with `callback` getting called when done.

`directory` can exist or not and can be relative or absolute. If files exist within the directory, they may be overwritten.

`callback` receives an `err` as the first parameter, which will be null if there's no error.

Only the locked versions of the stamp and key are saved to the disk.

```js
ident.createUser(pass, {name: 'pb'}, function (err, user) {
  if (err) throw err
  serialize.saveUser(user, '/tmp/uzr', function (err) {
    if (err) throw err
    // user is saved to disk under /tmp/uzr
  })
})
```

## loadUser(passphrase, directory, callback)

Load a user that was saved to a directory. You must pass in the user's passphrase so that the secret keys can get decrypted.

```js
loadUser(pass, '/tmp/uzr/', function (err, user) {
  if (err) throw err
  // if the passphrase does not match, err will be an Error
  // user will be an object that looks exactly like a user generated in wot-identity with createUser
})
```
