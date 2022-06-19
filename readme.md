# ssh-bm

An ssh bookmarking program.

## Getting Started

1. Clone this repo
2. run `deno task compile` to get a executable

### Prerequisites

Requirements for the software and other tools to build, test and push

- [deno](https://deno.land)

## Running the tests

`deno test test` - runs all tests in the *test* directory

## Deployment

Two options for using the built application
1. Add the dist directory to your PATH environment variable

or

2. Add the compiled binary to a directory already in your PATH variable (/usr/bin is pretty standard).

## Built With

- [Contributor Covenant](https://www.contributor-covenant.org/) - Used for the
  Code of Conduct

## Usage

> ssh-bm cms -> ssh into cms

> ssh-bm put cms user@23.12.12.12 -> adds/updates bookmark named cms

> ssh-bm wipe cms -> removes cms

> ssh-bm find cms -> prints bookmark to terminal

> ssh-bm list -> lists all available bookmarks

> ssh-bm X --help -> print help statement

> ssh-bm flush -> resets collection after confirmation

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of
conduct, and the process for submitting pull requests to us.

## Versioning

We use [Semantic Versioning](http://semver.org/) for versioning. For the
versions available, see the
[tags on this repository](https://github.com/PurpleBooth/a-good-readme-template/tags).

## Authors

- **Dakota Lewallen** - _Original Maintainer_ -
  [IamFlowZ](https://github.com/IamFlowZ)

See also the list of
[contributors](https://github.com/PurpleBooth/a-good-readme-template/contributors)
who participated in this project.

## License

This project is licensed under the [Apache](LICENSE.md) License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

