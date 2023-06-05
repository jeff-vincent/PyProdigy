import logging
import os
import docker
from fastapi import FastAPI, Form, File 
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated


app = FastAPI()
docker_client = docker.from_env()

logging.basicConfig(
    level=logging.INFO,  # Set the desired logging level
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler("app.log"),  # Specify the log file name and path
        logging.StreamHandler()  # Print log messages to the console
    ]
)


# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # Add the URL of your React app here
    # Add more allowed origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/run')
def run(cmd: Annotated[str, Form()], os: Annotated[str, Form()]):
    if not os:
        os = 'ubuntu:latest'
    try:
        response = docker_client.containers.run(os, cmd)
    except Exception as e:
        return f"Error: {str(e)}"
    return response

@app.post('/build')
def build_image(script: Annotated[str, Form()]):
    
    # random hash for tmp dirs...
    # os.mkdir('/tmp9283498/')
    with open('script.py', 'w') as f:
        for line in script:
            f.write(line)
    with open('Dockerfile', 'w') as d:
        d.write('FROM python:latest\nCOPY script.py .\nCMD python script.py\n')
    docker_client.images.build(path='./', tag="new_image")
    try:
        response = docker_client.containers.run("new_image")
        logging.info(response)
    except docker.errors.ContainerError as e:
        return str(e)
    return response