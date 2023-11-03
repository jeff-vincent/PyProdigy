import binascii
import os
import shutil
import tempfile
import requests
import subprocess
import logging

from typing import Annotated
from kubernetes import client, config
from fastapi import FastAPI, Form


app = FastAPI()

# Check if running inside a Kubernetes cluster
if 'KUBERNETES_SERVICE_HOST' in os.environ and 'KUBERNETES_SERVICE_PORT' in os.environ:
    # Load the in-cluster configuration
    config.load_incluster_config()
else:
    # Load the kubeconfig file
    config.load_kube_config()

# Create the Kubernetes API client
api_client = client.ApiClient()

logging.basicConfig(level=logging.INFO)  # Set logging level to INFO


@app.get('/compute/start/{user_id}')
def start_container(user_id: str):
    run_pod_manifest = _create_run_pod_manifest('python:latest', user_id)

    try:
        api_instance = client.CoreV1Api(api_client)
        api_instance.create_namespaced_pod(namespace="default", body=run_pod_manifest)
    except Exception as e:
        running_pod = get_pod(user_id)
        if running_pod:
            return f"Pod status: {running_pod}"
        return f"Error creating pod: {str(e)}"

    return f"Container {user_id} created."


def _create_run_pod_manifest(image_name: str, user_id: str) -> client.V1Pod:
    main_container = client.V1Container(
        name=user_id,
        image=image_name,
        command=["tail", "-f", "/dev/null"],  # Keep the main container running indefinitely
    )

    pod_spec = client.V1PodSpec(
        containers=[main_container],
        restart_policy="Never",
        service_account_name="default",
    )

    pod_manifest = client.V1Pod(
        metadata=client.V1ObjectMeta(name=user_id, labels={"app": user_id}),
        spec=pod_spec,
    )

    return pod_manifest


@app.post('/compute/run')
async def attach_to_container_run_script(script: Annotated[str, Form()], user_id: Annotated[str, Form()]):
    _hash = _generate_hash()
    tmp_dir = tempfile.mkdtemp(prefix=_hash)

    script_path = os.path.join(tmp_dir, 'script.py')

    logging.info(f"user: {user_id} script: {script}")

    with open(script_path, 'w') as f:
        for line in script:
            f.write(line)
    try:
        pod_name = str(user_id)
        subprocess.run(['kubectl', 'cp', 'log_event.py', f'{pod_name}:log_event.py'])
        # copy the script into the pod
        subprocess.run(['kubectl', 'cp', script_path, f'{pod_name}:script.py'])
        # run the script
        exec_command = ['/bin/bash', '-c', 'python script.py']
        result = subprocess.run([
            'kubectl', 'exec', pod_name, '--namespace', 'default', '--', *exec_command
        ], capture_output=True)
        log_event_command = ['/bin/bash', '-c', 'python log_event.py']
        # log event to event_log.txt
        subprocess.run([
            'kubectl', 'exec', pod_name, '--namespace', 'default', '--', *log_event_command])
        shutil.rmtree(tmp_dir)
        if not result.stderr:
            return result.stdout
        return result.stderr
    except Exception as e:
        return f"Error attaching to pod: {str(e)}"


@app.get('/compute/delete/{user_sub}')
def delete_container_on_logout(user_sub: str):
    # TODO: get user id with user sub, pass user id in following call
    r = requests.get(f'http://users:8000/api/get-user-by-sub/{user_sub}')
    user_data = r.json()
    result = subprocess.run(['kubectl', 'delete', 'pod', str(user_data['id']), '--namespace', 'default'])
    return result


@app.get('/compute/get-pod/{user_id}')
def get_pod(user_id: str):
    result = subprocess.run(['kubectl', 'get', 'pod', user_id], capture_output=True)
    result_string = result.stdout.decode('utf-8')
    if 'Running' in result_string:
        return 'Running'
    if 'Terminating' in result_string:
        return 'Terminating'
    if 'Creating' in result_string:
        return 'Creating'
    else:
        return False


def _generate_hash():
    return binascii.hexlify(os.urandom(16)).decode('utf-8')
