# Kubernetes deployment templates

These manifests and the Helm chart are deployment templates, not a self-contained
Kubernetes platform. They deploy the Config Server, Eureka registry, API gateway,
and four application services. MySQL, Kafka, and Redis must already be
reachable from the `eventico` namespace (or their addresses must be overridden).

Replace the example GHCR image names and confirm the database schemas exist:
`eventico-core-demo`, `eventico-form`, `eventico-timeclock`, and `eventico-finance`.
The shared database account must have access only to those schemas.

## Plain manifests

1. Set a non-empty `JWT_AUDIENCE` in `configmap-platform.yaml`.
2. Create the namespace and ConfigMap:

   ```powershell
   kubectl apply -f backend/deploy/k8s/namespace.yaml
   kubectl apply -f backend/deploy/k8s/configmap-platform.yaml
   ```

3. Create the referenced secrets through your secret manager or an approved
   secure process. Required names and keys:

   - `eventico-jwt-secrets`: `signing-secret`
   - `eventico-database-secrets`: `username`, `password`

4. Apply the workload and ClusterIP services:

   ```powershell
   kubectl apply -f backend/deploy/k8s/microservices.yaml
   ```

The ConfigMap routes Config Client requests to `config-server` and Eureka clients
to `service-registry`. It also supplies the service database URLs and broker
addresses. Edit it if the external platform dependencies use different DNS names.

## Helm chart

Set `global.jwtAudience`, image references, and external dependency addresses in
`backend/deploy/helm/eventico/values.yaml` or an environment-specific values file.
Create the same three secrets in the target namespace, then install:

```powershell
helm upgrade --install eventico backend/deploy/helm/eventico `
  --namespace eventico --create-namespace `
  --values backend/deploy/helm/eventico/values.yaml
```

The chart creates `service-registry`, `config-server`, the gateway, and all four
application services. It does not create database, broker, or cache infrastructure.
