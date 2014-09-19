# DCO: Developer's Certificate of Origin

Tools for analyzing and validating DCO signatures in git repositories.

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).

## Installation

```sh
npm install dco
```

## Usage

```js
var dco = require( "dco" );

dco.getCommits({
	path: ".",
	exceptionalAuthors: {
		"john.doe@example.com": "John Doe"
	}
}, function( error, commits ) {
	console.log( commits );
});
```

## API

### person objects

Person objects represent authors, committers, and signers. They are plain objects with the following properties:

* `name` (String): The person's name.
* `email` (String): The person's email.

### commit objects

Commit objects represent a single commit within a repository. They are plain objects with the following properties:

* `hash` (String): The SHA-1 for the commit.
* `author` (Object): A [person object](#person-objects) containing the author's information.
* `committer` (Object): A [person object](#person-objects) containing the committer's information.
* `license` (Array): An array of [person objects](#person-objects) containing all signers of the commit.

### dco.getCommits( options, callback )

Gets commit and signature information for a repository.

* `options` (Object): Options for getting the commits.
  * `path` (String): The path to the repository.
  * `committish` (String): Committish range to analyze.
  * `exceptionalAuthors` (Object): A hash of email addresses and names for authors who may commit without signing their commits.
* `callback` (Function; `function( error, commits )`): Function to invoke after getting the commits.
  * `commits` (Array): An array of [commit objects](#commit-objects) for the repository.

### dco.getCommitErrors( options, callback )

Gets commit errors for a repositry. Errors include invalid email addresses for authors, committers, and signers, as well as missing signatures for commits.

* `options` (Object): Options for getting the commits.
  * `path` (String): The path to the repository.
  * `committish` (String): Committish range to analyze.
  * `exceptionalAuthors` (Object): A hash of email addresses and names for authors who may commit without signing their commits.
* `callback` (Function; `function( error, errors, commits )`): Function to invoke after determining the commit errors.
  * `errors` (Array): An array of error messages for each invalid commit.
  * `commits` (Array): An array of [commit objects](#commit-objects) for the repository.

## License

Copyright 2014 Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).
