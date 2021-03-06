var Repo = require( "git-tools" );
var isEmail = require( "sane-email-validation" );

exports.getCommits = getCommits;
exports.getCommitErrors = getCommitErrors;

function unique( array ) {
	var elements = {};
	return array.filter(function( element ) {
		var exists = elements.hasOwnProperty( element );
		elements[ element ] = true;
		return !exists;
	});
}

function parsePerson( person ) {
	var matches = /^(.+)\s<([^>]+)>$/.exec( person );
	return {
		name: matches[ 1 ],
		email: matches[ 2 ]
	};
}

function getCommits( settings, callback ) {
	var repo = new Repo( settings.path );
	var committish = settings.committish || "master";
	var exceptional = settings.exceptionalAuthors || {};
	var delimiter = "---===DCO===---";

	repo.exec( "log",
		"--format=%H%n%aN <%aE>%n%cN <%cE>%n%b" + delimiter,
		committish,
	function( error, log ) {
		if ( error ) {
			return callback( error );
		}

		var commits = log.trim().split( delimiter );
		commits.pop();
		commits = commits.map(function( commit ) {
			var body = commit.trim().split( "\n" );
			var hash = body.shift();
			var author = parsePerson( body.shift() );
			var committer = parsePerson( body.shift() );
			var signatures = body
				.filter(function( line ) {
					return line.substring( 0, 13 ) === "Signed-off-by";
				})
				.map(function( line ) {
					return parsePerson( line.substring( 15 ) );
				});

			// If there are no signatures, but the author is exceptional,
			// treat the commit as if the author had signed it
			if ( !signatures.length &&
					exceptional.hasOwnProperty( author.email ) &&
					exceptional[ author.email ] === author.name ) {
				signatures.push( author );
			}

			return {
				hash: hash,
				author: author,
				committer: committer,
				license: signatures
			};
		});

		callback( null, commits );
	});
}

function validatePerson( person, description ) {
	var errors = [];

	if ( !isEmail( person.email ) ) {
		errors.push( description + " has invalid email address: " + person.email );
	}

	return errors;
}

function getCommitErrors( settings, callback ) {
	getCommits( settings, function( error, commits ) {
		if ( error ) {
			return callback( error );
		}

		var errors = [];
		commits.forEach(function( commit ) {
			errors = errors.concat( validatePerson( commit.author, "Author" ) );
			errors = errors.concat( validatePerson( commit.committer, "Committer" ) );

			if ( !commit.license.length ) {
				errors.push( "Missing DCO for " + commit.hash + "." );
			} else {
				commit.license.forEach(function( signature ) {
					errors = errors.concat( validatePerson( signature, "Signer" ) );
				});
			}
		});

		errors = unique( errors );
		callback( null, errors, commits );
	});
}
