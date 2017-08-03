# inline-require

> Replace require'd files with the files' contents

[![npm version](https://badge.fury.io/js/inline-require.svg)](https://badge.fury.io/js/inline-require)
[![Build Status](https://img.shields.io/travis/msimmer/inline-require/master.svg?style=flat)](https://travis-ci.org/msimmer/inline-require)

Inline dependencies from required modules. Can be used as a module using `require` or on the CLI.

## Install

```sh
$ yarn add inline-require
```

## Usage

```js
// my-dependency.js
module.exports = { foo: 'bar' }
```

```js
// index.js
const myDependency = require('./my-dependency')
```

```js
// build.js
const inliner = require('inline-require')

inliner('./index.js', (err, data) => {
    if (err) { throw err }
    console.log(data) // => const myDependency = { foo: 'bar' }
})
```

## CLI

```sh
$ node ./inliner ./main.js # prints to stdoout
```