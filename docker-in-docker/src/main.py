import binascii
import logging
import os
import shutil
import tempfile
from time import time
from kubernetes import client, config, watch
from kubernetes.client import V1Container, V1PodSpec, V1PodTemplateSpec, V1Pod, V1ObjectMeta, V1JobSpec, V1Job, V1EnvVar, V1VolumeMount, V1Volume, V1HostPathVolumeSource, V1ConfigMap, V1ConfigMapVolumeSource
from typing import Annotated
from fastapi import FastAPI, Form

app = FastAPI()

logging.basicConfig(
    level=logging.INFO,  # Set the desired logging level
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler("app.log"),  # Specify the log file name and path
        logging.StreamHandler()  # Print log messages to the console
    ]
)

# Check if running inside a Kubernetes cluster
if 'KUBERNETES_SERVICE_HOST' in os.environ and 'KUBERNETES_SERVICE_PORT' in os.environ:
    # Load the in-cluster configuration
    config.load_incluster_config()
else:
    # Load the kubeconfig file
    config.load_kube_config()

# Create the Kubernetes API client
api_client = client.ApiClient()


def _cleanup_old_jobs():
    try:
        api_instance = client.BatchV1Api(api_client)
        # List all jobs with a specific label
        job_list = api_instance.list_namespaced_job(namespace="default", label_selector="app=docker-build-job")
        for job in job_list.items:
            # Delete each old job
            api_instance.delete_namespaced_job(name=job.metadata.name, namespace="default")
    except Exception as e:
        # Handle the exception if the deletion fails
        return f"Error cleaning up old jobs: {str(e)}"


@app.post('/docker/build')
def build_and_run_image(script: Annotated[str, Form()]):
    _cleanup_old_jobs()

    hash = _generate_hash()
    tmp_dir = tempfile.mkdtemp(prefix=hash)

    script_path = os.path.join(tmp_dir, 'script.py')
    dockerfile_path = os.path.join(tmp_dir, "Dockerfile")

    with open(script_path, 'w') as f:
        for line in script:
            f.write(line)
    with open(dockerfile_path, 'w') as d:
        d.write(f'FROM python:latest\nCOPY script.py .\nCMD python script.py\n')

    image_name = f"docker-image-{hash}"
    config_map_name = f"build-data-config-{_generate_hash()}"
    config_map_data = {
        "script.py": script,
        "Dockerfile": f'FROM python:latest\nCOPY script.py .\nCMD python script.py\n'
    }
    config_map_manifest = V1ConfigMap(
        metadata=V1ObjectMeta(name=config_map_name),
        data=config_map_data
    )
    api_instance = client.CoreV1Api(api_client)
    api_instance.create_namespaced_config_map(namespace="default", body=config_map_manifest)

    job_manifest = _create_build_job_manifest(tmp_dir, image_name, config_map_name)

    try:
        api_instance = client.BatchV1Api(api_client)
        api_instance.create_namespaced_job(namespace="default", body=job_manifest)
    except Exception as e:
        shutil.rmtree(tmp_dir)
        return f"Error creating job: {str(e)}"

    container = V1Container(
        name=job_manifest.metadata.name,
        image="docker",
        command=["docker", "build", "-t", image_name, "-f", "/build-data/Dockerfile", "/build-data"],
        volume_mounts=[
            V1VolumeMount(mount_path="/var/run/docker.sock", name="docker-socket"),
            V1VolumeMount(mount_path="/build-data", name="build-data-volume")
        ],
    )

    build_pod_spec = V1PodSpec(
        containers=[container],
        restart_policy="Never",
        volumes=[
            V1Volume(name="docker-socket", host_path=V1HostPathVolumeSource(path="/var/run/docker.sock")),
            V1Volume(name="build-data-volume", config_map=V1ConfigMapVolumeSource(name=config_map_name))
        ],
    )

    build_job_spec = V1JobSpec(
        template=V1PodTemplateSpec(metadata=V1ObjectMeta(labels={"app": "docker-build-job"}), spec=build_pod_spec),
        backoff_limit=0,
    )

    build_job_manifest = V1Job(
        metadata=V1ObjectMeta(name=f"docker-build-job-{_generate_hash()}"),
        spec=build_job_spec,
    )

    try:
        api_instance = client.BatchV1Api(api_client)
        api_instance.create_namespaced_job(namespace="default", body=build_job_manifest)
    except Exception as e:
        shutil.rmtree(tmp_dir)
        return f"Error creating job: {str(e)}"

        # Wait for the image to be built successfully
    try:
        while True:
            time.sleep(1)  # Wait for 1 second before checking the image status
            image_status = _check_image_status(image_name)
            if image_status == "Ready":
                break
            elif image_status == "Error":
                return "Image build failed."

    run_pod_manifest = _create_run_pod_manifest(image_name)

    try:
        api_instance = client.CoreV1Api(api_client)
        api_instance.create_namespaced_pod(namespace="default", body=run_pod_manifest)
    except Exception as e:
        shutil.rmtree(tmp_dir)
        return f"Error creating pod: {str(e)}"

    # Watch the Pod events to retrieve the output
    try:
        w = watch.Watch()
        for event in w.stream(api_instance.list_namespaced_pod, namespace="default", label_selector="app=docker-run-pod"):
            pod = event['object']
            if pod.status.phase == "Succeeded":
                output = _retrieve_pod_logs(pod)
                return output
    except Exception as e:
        return f"Error watching Pod events: {str(e)}"

    return "Unknown error occurred."


def _create_run_pod_manifest(image_name: str) -> V1Pod:
    pod_name = f"docker-run-pod-{_generate_hash()}"  # Using random string

    container = V1Container(
        name=pod_name,
        image=image_name,
    )

    pod_spec = V1PodSpec(
        containers=[container],
        restart_policy="Never",
    )

    pod_manifest = V1Pod(
        metadata=V1ObjectMeta(name=pod_name, labels={"app": "docker-run-pod"}),
        spec=pod_spec,
    )

    return pod_manifest


def _retrieve_pod_logs(pod: V1Pod) -> str:
    api_instance = client.CoreV1Api(api_client)
    log = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace="default")
    return log


def _generate_hash():
    return binascii.hexlify(os.urandom(16)).decode('utf-8')


def _create_build_job_manifest(tmp_dir: str, image_name: str, config_map_name: str) -> V1Job:
    job_name = f"docker-build-job-{_generate_hash()}"  # Using random string

    container = V1Container(
        name=job_name,
        image="docker",
        command=["docker", "run", "-d", "--name", job_name, image_name],
        volume_mounts=[
            V1VolumeMount(mount_path="/var/run/docker.sock", name="docker-socket"),
            V1VolumeMount(mount_path="/build-data", name="build-data-volume")
        ],
    )

    pod_spec = V1PodSpec(
        containers=[container],
        restart_policy="Never",
        volumes=[
            V1Volume(name="docker-socket", host_path=V1HostPathVolumeSource(path="/var/run/docker.sock")),
            V1Volume(name="build-data-volume", config_map=V1ConfigMapVolumeSource(name=config_map_name))
        ],
    )

    job_spec = V1JobSpec(
        template=V1PodTemplateSpec(metadata=V1ObjectMeta(labels={"app": "docker-build-job"}), spec=pod_spec),
        backoff_limit=0,
    )

    job_manifest = V1Job(
        metadata=V1ObjectMeta(name=job_name),
        spec=job_spec,
    )

    return job_manifest

def _check_image_status(image_name: str) -> str:
    api_instance = client.CoreV1Api(api_client)
    try:
        image_info = api_instance.read_namespaced_pod(namespace="default", name=image_name)
        if image_info.status.phase == "Succeeded":
            return "Ready"
        elif image_info.status.phase == "Failed":
            return "Error"
        else:
            return "Building"
    except Exception as e:
        return "Building"
