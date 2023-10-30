## deploy cert-manager
```
kubectl create ns cert-manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.yaml
```
## deploy cluster issuer
```
kubectl apply -f issuer_prod.yaml
```
## deploy NGINX ingress controller
```
kubectl create namespace ingress-nginx

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-nginx
```

## deploy app
```
helm template . -f k8s/values.yaml | kubectl apply -f -
```
