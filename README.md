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
![PyProdigy-demo.gif](img%2FPyProdigy-demo.gif)
