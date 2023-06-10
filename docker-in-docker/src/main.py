import binascii
import logging
import os
import shutil
import subprocess
import tempfile
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


@app.post('/docker/build')
async def build_and_run_image(script: Annotated[str, Form()]):

    hash = _generate_hash()
    try:
        tmp_dir = tempfile.mkdtemp(prefix=hash)
        script_path = os.path.join(tmp_dir, 'script.py')
        cmd = 'python'
    except Exception as e:
        return str(e)

    with open(script_path, 'w') as f:
        for line in script:
            f.write(line)
    result = await _run_process(cmd, script_path)
    if not result.stderr:
        return result.stdout
    else:
        return result.stderr


async def _run_process(cmd: str, script_path: str):
    result = subprocess.run([cmd, script_path], capture_output=True)
    return result

def _generate_hash():
    return binascii.hexlify(os.urandom(16)).decode('utf-8')
