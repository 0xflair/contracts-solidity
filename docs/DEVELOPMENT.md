# Development Guidelines

## This is a work in Progress!

General guidelines for developing smart contracts within Flair platform.

# Diamonds

## Core

Main components of a scalable multi-contract system, that uses Diamonds EIP-2535, to deploy and manage a multi-faceted proxy.

- **Diamond** The entry point of all external calls to your multi-faceted dApp.
- **DiamondCut** Facet management, adding and removing facets.
- **DiamondLoupe** Facet introspection, getting information about facets of a diamond (their implementation addresses and function selectors).

## Extensions

Extensions are contracts that must be inherited by facets, and cannot be added to a diamond directly. Minting, burning, locking and supply tracking are examples of extensions.

A rule of thumb of identifying an extension is if they are overriding an internal function of another contract (e.g. overriding beforeTransfer() call of ERC20 or ERC721 contracts)

## Presets

A ready-made composition of extensions ready to be added as a facet to a diamond. For example an ERC721 preset that includes minting, burning and locking extensions.

## Facets

A facet adds external functions to the diamond, may introduce a new storage layout, may use other facets storage layout, may include implementation code of other facets.
