# Overview

The repository consists of

- verification-predicate

The predicate is employed to authenticate that the signer in a transaction corresponds to a particular EVM wallet.

## Building the projects

Prerequsite: have `forc` installed.

In the root of the repository run

```bash
forc build --release
```

This will build the project and is required before tests can be run.

## Continuous Integration (CI)

To satisfy CI checks run the following commands from the root of the repository.

Format Sway files

```bash
forc fmt
```

Any warnings presented by clippy must be resolved.
