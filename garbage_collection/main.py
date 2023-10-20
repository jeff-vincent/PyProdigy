import time

# TODO:
# kubectl get pods
# iterate over pods and get logs from each
# parse logs for timestamp of most recent event
# if time delta is greater than "x" delete pod


class GarbageCollection:
    def __init__(self):
        self.pods_list = None

    def get_pods(self):
        pass

    def _parse_logs(self):
        pass

    def _get_interval(self):
        pass

    def _delete_pod(self):
        pass

    def get_logs_and_delete_inactive_pods(self):
        pass

    def run(self):
        self.get_pods()
        self.get_logs_and_delete_inactive_pods()


def main():
    gc = GarbageCollection()
    while True:
        gc.run()
        time.sleep(600)


if __name__ == '__main__':
    main()
