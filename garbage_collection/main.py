import time
import subprocess
import re


class GarbageCollection:
    def __init__(self):
        self.pods_list = []
        self.reg_ex_pattern = r'^[0-9]+$'

    def get_pods(self):
        pods = subprocess.run(['kubectl', 'get', 'pods'], capture_output=True)
        line_list = pods.stdout.decode('utf-8').split('\n')
        for line in line_list:
            pod_name = line.split(' ')[0]
            if re.search(self.reg_ex_pattern, pod_name):
                self.pods_list.append(pod_name)

        print(self.pods_list)

    def _delete_pod(self, pod):
        subprocess.run(['kubectl', 'delete', 'pod', pod])

    def get_logs_and_delete_inactive_pods(self):
        now = time.time()
        for pod in self.pods_list:
            last_pod_event = subprocess.run(['kubectl', 'exec', pod, '--', '/bin/bash', '-c', 'cat event_log.txt'], capture_output=True)
            try:
                inactive_duration = now - float(last_pod_event.stdout.decode('utf-8'))
                print(f'Pod {pod} inactive for {inactive_duration}')
                if inactive_duration > 300:
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
