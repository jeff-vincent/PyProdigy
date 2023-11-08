import os
import time
import subprocess
import re
from kubernetes import  config

# Check if running inside a Kubernetes cluster
if 'KUBERNETES_SERVICE_HOST' in os.environ and 'KUBERNETES_SERVICE_PORT' in os.environ:
    # Load the in-cluster configuration
    config.load_incluster_config()
else:
    # Load the kubeconfig file
    config.load_kube_config()


class GarbageCollection:
    def __init__(self):
        self.pods_list = []
        self.reg_ex_pattern = r'^[0-9]+$'

    def get_pods(self):
        pods = subprocess.run(['kubectl', 'get', 'pods', '--namespace', 'user-envs'], capture_output=True)
        line_list = pods.stdout.decode('utf-8').split('\n')
        for line in line_list:
            pod_name = line.split(' ')[0]
            if re.search(self.reg_ex_pattern, pod_name):
                self.pods_list.append(pod_name)

        print(self.pods_list)

    def _delete_pod(self, pod):
        subprocess.run(['kubectl', 'delete', 'pod', pod, '--namespace', 'user-envs'])

    def get_logs_and_delete_inactive_pods(self):
        now = time.time()
        for pod in self.pods_list:
            last_pod_event = subprocess.run(['kubectl', 'exec', pod, '--namespace', 'user-envs', '--', '/bin/bash', '-c', 'cat event_log.txt'], capture_output=True)
            if last_pod_event.stderr:
                subprocess.run(['kubectl', 'cp', 'log_event.py', f'{pod}:log_event.py', '--namespace', 'user-envs'])
                log_event_command = ['/bin/bash', '-c', 'python log_event.py']
                # log event to event_log.txt
                subprocess.run([
                    'kubectl', 'exec', pod, '--namespace', 'user-envs', '--', *log_event_command])
            try:
                inactive_duration = now - float(last_pod_event.stdout.decode('utf-8'))
                print(f'Pod {pod} inactive for {inactive_duration}')
                if inactive_duration > 600:
                    self._delete_pod(pod)
            except:
                pass

    def run(self):
        self.get_pods()
        self.get_logs_and_delete_inactive_pods()


def main():
    gc = GarbageCollection()
    while True:
        gc.run()
        time.sleep(10)
        gc.pods_list = []


if __name__ == '__main__':
    main()
