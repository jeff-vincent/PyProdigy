import binascii
import os
import shutil
import tempfile
import subprocess
import logging
import re

from typing import Annotated
from kubernetes import client, config
from fastapi import FastAPI, Form, Request
from middleware import TokenValidationMiddleware


app = FastAPI()
app.add_middleware(TokenValidationMiddleware)

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


@app.get('/compute/start')
def start_container(request: Request):
    logging.info(f'Local user_id: {request.state.user_info}')
    user_id = request.state.user_info
    run_pod_manifest = _create_run_pod_manifest('jdvincent/pyprodigy-user-env:latest', str(user_id))
    try:
        api_instance = client.CoreV1Api(api_client)
        api_instance.create_namespaced_pod(namespace="user-envs", body=run_pod_manifest)
    except Exception as e:
        logging.info(f'failed to create pod: {str(e)}')
        running_pod = get_pod(str(user_id))
        if running_pod:
            return f"Pod status: {running_pod}"
        return f"Error creating pod: {str(e)}"

    return f"Container {user_id} created."


def _create_run_pod_manifest(image_name: str, user_id: str) -> client.V1Pod:
    main_container = client.V1Container(
        name=user_id,
        image=image_name,
        command=["tail", "-f", "/dev/null"],  # Keep the main container running indefinitely
        resources=client.V1ResourceRequirements(
            requests={"cpu": "10m", "memory": "32Mi"},
            limits={"cpu": "40m", "memory": "64Mi"},
        ),
        security_context=client.V1SecurityContext(
            # run_as_non_root=True,  # Run the container as non-root user
            allow_privilege_escalation=False  # Disallow privilege escalation
        )
    )

    pod_spec = client.V1PodSpec(
        containers=[main_container],
        restart_policy="Never",
        service_account_name="default",
    )

    pod_manifest = client.V1Pod(
        metadata=client.V1ObjectMeta(name=user_id, labels={"app": "user-env", "user": user_id}),
        spec=pod_spec,
    )

    return pod_manifest


def _check_for_infinite_loop(script_content):
    # Regular expressions to match common infinite loop patterns
    loop_patterns = [
        r'while\s*True\s*:',     # Matches while True:
        r'while\s*1\s*:',        # Matches while 1:
        r'while\s*\(.+\)\s*:',   # Matches while (condition):
    ]

    for pattern in loop_patterns:
        if re.search(pattern, script_content):
            return True

    return False

@app.post('/compute/run')
async def attach_to_container_run_script(request: Request, script: Annotated[str, Form()]):
    user_id = request.state.user_info
    _hash = _generate_hash()
    tmp_dir = tempfile.mkdtemp(prefix=_hash)

    script_path = os.path.join(tmp_dir, 'script.py')

    logging.info(f"user: {user_id} script: {script}")

    with open(script_path, 'w') as f:
        for line in script:
            f.write(line)
    if _check_for_infinite_loop(script):
        return 'Error: infinite loop'
    try:
        pod_name = str(user_id)
        # copy the script into the pod
        subprocess.run(['kubectl', 'cp', script_path, '--namespace', 'user-envs', f'{pod_name}:script.py'])
        # run the script
        exec_command = ['/bin/sh', '-c', 'python script.py']
        result = subprocess.run([
            'kubectl', 'exec', pod_name, '--namespace', 'user-envs', '--', *exec_command
        ], capture_output=True)
        log_event_command = ['/bin/sh', '-c', 'python log_event.py']
        # log event to event_log.txt
        r = subprocess.run([
            'kubectl', 'exec', pod_name, '--namespace', 'user-envs', '--', *log_event_command], capture_output=True)

        shutil.rmtree(tmp_dir)
        if not result.stderr:
            return result.stdout
        return result.stderr
    except Exception as e:
        return f"Error attaching to pod: {str(e)}"


@app.get('/compute/delete')
def delete_container_on_logout(request: Request):
    user_id = request.state.user_info
    result = subprocess.run(['kubectl', 'delete', 'pod', str(user_id), '--namespace', 'user-envs'])
    return result


def get_pod(user_id: str):
    result = subprocess.run(['kubectl', 'get', 'pod', user_id, '--namespace', 'user-envs',], capture_output=True)
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
