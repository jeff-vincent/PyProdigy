# PyProdigy
A microservices-based application built with FastAPI services deployed in Kubernetes via Helm. 

## Auth
The application includes Auth0 for user authentication.

## Video Streaming
The application stores and streams video from a MongoDB GridFS instance deployed in the cluster.

## In browser IDE
The application includes a syntax-highlighted IDE for lessons and practice. 

## User-specific compute
The application leverages the Python SDK for Kubernetes to spin up an isolated compute environment for each logged in user (a K8s Pod).

## Architecture
![dev-bootcamp.png](img%2Fdev-bootcamp.png)

## Demo
![PyProdigy.gif](img%2FPyProdigy.gif)


## Run it locally in a Kind cluster

1. Install Kind
```
brew install kind
```

2. Spin up a cluster based on the following config:
```
kind create cluster --config=config.yaml
```

```
#config.yaml

kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
```
3. Add an NGINX ingress controller
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```
4. Deploy the app
```
cd k8s 
helm template . -f values.yaml | kubectl apply -f -
```
5. Navigate to `https://127.0.0.1` and log in with email or GitHub

