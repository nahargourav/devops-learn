# NovaCart Retail DevOps Capstone

NovaCart Retail is a microservices-based retail application with three Node.js services, Docker packaging, CI/CD via GitHub Actions, and Kubernetes deployment manifests for a Kind cluster.

## Architecture Diagram

```text
+-------------------+        REST        +---------------------+
| Frontend Service  |------------------->| Product Service     |
| Node.js + Express |                    | GET /products       |
| Port 3000         |                    | GET /health         |
+-------------------+                    +---------------------+
          |
          | REST
          v
+---------------------+
| Cart Service        |
| POST /cart/add      |
| GET /cart           |
| GET /health         |
| Port 3002           |
+---------------------+
```

## Folder Structure

```text
novacart-retail/
+-- frontend/
+-- product-service/
+-- cart-service/
+-- k8s/
+-- terraform/
+-- .github/workflows/
+-- README.md
```

## Service APIs

### Frontend
- `GET /` UI with Home, Products, Cart tabs
- `GET /api/products` proxy to product service
- `POST /api/cart/add` proxy to cart service
- `GET /api/cart` proxy to cart service
- `GET /health`
- `GET /version`

### Product Service
- `GET /products`
- `GET /health`
- `GET /version`

### Cart Service
- `POST /cart/add`
- `GET /cart`
- `GET /health`
- `GET /version`

## Local Run (without Docker)

1. Install dependencies:
```bash
cd frontend && npm install
cd ../product-service && npm install
cd ../cart-service && npm install
```

2. Start services in 3 terminals:
```bash
cd product-service && npm start
cd cart-service && npm start
cd frontend && npm start
```

Local defaults used by frontend:
- `PRODUCT_SERVICE_URL=http://localhost:3001`
- `CART_SERVICE_URL=http://localhost:3002`

Override example (if needed):
```bash
cd frontend
PRODUCT_SERVICE_URL=http://product-service:3001 CART_SERVICE_URL=http://cart-service:3002 npm start
```

3. Open:
```text
http://localhost:3000
```

## Docker Build, Tag, Push

Replace `murughan1985` with your Docker Hub username.

### Frontend
```bash
docker build -t murughan1985/novacart-frontend:v1 ./frontend
docker tag murughan1985/novacart-frontend:v1 murughan1985/novacart-frontend:latest
docker push murughan1985/novacart-frontend:v1
docker push murughan1985/novacart-frontend:latest
```

### Product Service
```bash
docker build -t murughan1985/novacart-product-service:v1 ./product-service
docker tag murughan1985/novacart-product-service:v1 murughan1985/novacart-product-service:latest
docker push murughan1985/novacart-product-service:v1
docker push murughan1985/novacart-product-service:latest
```

### Cart Service
```bash
docker build -t murughan1985/novacart-cart-service:v1 ./cart-service
docker tag murughan1985/novacart-cart-service:v1 murughan1985/novacart-cart-service:latest
docker push murughan1985/novacart-cart-service:v1
docker push murughan1985/novacart-cart-service:latest
```

## GitHub Actions CI/CD

Workflow file: `.github/workflows/ci.yml`

Trigger:
- Push to `main`

Pipeline actions:
- Checkout code
- Setup Docker Buildx
- Login to Docker Hub (secrets required)
- Build and push all 3 service images
- Tags each image with:
  - `v1`
  - `${{ github.sha }}`

Required repository secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Kubernetes Deployment (Kind)

Before applying manifests, update image names in `k8s/*.yaml` from `murughan1985/...` to your Docker Hub username.

### Create Kind cluster
```bash
kind create cluster --name novacart
```

### Deploy all resources
```bash
kubectl apply -f k8s/
```

### Check pods and services
```bash
kubectl get pods
kubectl get svc
kubectl get deployments
```

### Access app
Frontend is exposed via NodePort `30080`:
```text
kubectl port-forward svc/frontend 3000:3000

http://localhost:30080
```

### Scale deployments
```bash
kubectl scale deployment/product-service --replicas=3
kubectl scale deployment/cart-service --replicas=3
kubectl get pods
```

### Rollback deployment
```bash
kubectl rollout history deployment/frontend
kubectl rollout undo deployment/frontend
kubectl rollout undo deployment/product-service
kubectl rollout undo deployment/cart-service
```

## Sample Curl Tests

```bash
curl http://localhost:30080/health
curl http://localhost:30080/version
curl http://localhost:30080/api/products
curl -X POST http://localhost:30080/api/cart/add -H "Content-Type: application/json" -d '{"productId":"p-1001"}'
curl http://localhost:30080/api/cart
```

## Terraform Example (IaC)

Terraform example is in `terraform/main.tf` and demonstrates a local Docker provider setup with a `docker_container` resource.

Commands:
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## Notes

- Cart storage is in-memory (resets on pod/container restart).
- Health probes are configured with `/health` on all services.
- Frontend uses environment variables for backend service URLs.
