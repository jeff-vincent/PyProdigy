import binascii
import logging
import os
import shutil
import tempfile
import docker
from fastapi import FastAPI, Form
from typing import Annotated

DOCKER_HOST = os.environ.get('DOCKER_HOST')
DOCKER_PORT = os.environ.get('DOCKER_PORT')
app = FastAPI()

DOCKER_HOST = f"tcp://{DOCKER_HOST}:{DOCKER_PORT}"

# docker_client = docker.from_env()
docker_client = docker.DockerClient(base_url=DOCKER_HOST)

logging.basicConfig(
    level=logging.INFO,  # Set the desired logging level
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler("app.log"),  # Specify the log file name and path
        logging.StreamHandler()  # Print log messages to the console
    ]
)


@app.post('/docker/run')
def run(cmd: Annotated[str, Form()], os: Annotated[str, Form()]):
    if not os:
        os = 'ubuntu:latest'
    try:
        response = docker_client.containers.run(os, cmd)
    except Exception as e:
        return f"Error: {str(e)}"
    return response


@app.post('/docker/build')
def build_image(script: Annotated[str, Form()]):
    hash = _generate_hash()
    tmp_dir = tempfile.mkdtemp(prefix=hash)

    script_path = os.path.join(tmp_dir, 'script.py')
    dockerfile_path = os.path.join(tmp_dir, "Dockerfile")

    with open(script_path, 'w') as f:
        for line in script:
            f.write(line)
    with open(dockerfile_path, 'w') as d:
        d.write('FROM python:latest\nCOPY script.py .\nCMD python script.py\n')
    docker_client.images.build(path=tmp_dir, tag="new_image")
    try:
        response = docker_client.containers.run("new_image")
        logging.info(response)
    except docker.errors.ContainerError as e:
        _remove_directory(tmp_dir)
        _clean_up_docker()
        return str(e)
    _clean_up_docker()
    _remove_directory(tmp_dir)
    return response


def _generate_hash():
    return binascii.hexlify(os.urandom(16)).decode('utf-8')


def _remove_directory(path):
    shutil.rmtree(path)


def _clean_up_docker():
    docker_client.images.prune()
    docker_client.containers.prune()
