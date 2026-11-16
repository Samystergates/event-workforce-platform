# Contract Test Scaffolding

This directory contains API contract definitions intended for provider/consumer contract validation.

## Layout

- `contracts/`: contract specs for service endpoints.
- `provider-hooks/`: optional provider test hooks/base classes.

## Suggested adoption

1. Pick one framework (`Spring Cloud Contract` or `Pact`) and keep it consistent.
2. Validate provider contracts in each service CI pipeline.
3. Validate consumer compatibility before release promotion.

## Current status

- Seed contracts are placeholders and should be replaced with real request/response assertions.
