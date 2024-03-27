# Overview

The repository consists of 2 projects

- verification-predicate
- verification-predicate

The predicate is used to verify the signer in a transaction is that of a specific EVM wallet.

The Script exists for the purpose of debugging the predicate.
Scripts can emit logs while predicates cannot therefore values may be inspected in the script.

The Sway code for the 2 projects ought to be identical except for the declaration of the project type on the first line.
The Rust tests (which utilize our Rust SDK and ethers-rs) ought to be close to identical except for the differences in how we set up scripts and predicates.

## Building the projects

Prerequsite: have `forc` installed.

In the root of the repository run

```bash
forc build --release
```

This will build both projects and is required before tests can be run.

## Running the tests

Prerequsite: have `cargo` installed.

In the root of the repository run

```bash
cargo test
```

This will run the tests for both projects.

## Continuous Integration (CI)

To satisfy CI checks run the following commands from the root of the repository.

Format Sway files

```bash
forc fmt
```

Format Rust files

```bash
cargo fmt
```

Check for Rust code suggestions

```bash
cargo clippy --all-features --all-targets -- -D warnings
```

Any warnings presented by clippy must be resolved.
