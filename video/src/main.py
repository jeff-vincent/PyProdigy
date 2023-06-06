import os
import binascii
import aiohttp
from fastapi import FastAPI, BackgroundTasks, UploadFile, Request, Form
from fastapi.responses import  HTMLResponse, StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from starlette.middleware.sessions import SessionMiddleware
# from starlette_exporter import PrometheusMiddleware, handle_metrics
import views

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key='abc')
# app.add_middleware(PrometheusMiddleware)
# app.add_route("/metrics", handle_metrics)

# PROTOCOL = os.environ.get('PROTOCOL')
# HOST = os.environ.get('HOST')
# MONGO_HOST = os.environ.get('MONGO_HOST')
# MONGO_PORT = os.environ.get('MONGO_PORT')
# AUTH_HOST = os.environ.get('AUTH_HOST')
# AUTH_PORT = os.environ.get('AUTH_PORT')

PROTOCOL = 'http'
HOST = 'localhost'
MONGO_HOST = 'localhost'
MONGO_PORT = '27017'

@app.on_event('startup')
async def get_mongo():
    video_db = AsyncIOMotorClient(f'mongodb://{MONGO_HOST}:{MONGO_PORT}').video
    app.library = video_db.library
    app.fs = AsyncIOMotorGridFSBucket(video_db)

@app.get('/video')
async def index():
    videos = await _get_videos()
    return HTMLResponse(f'{views.upload_block}{videos}')

async def _get_videos():
    videos = app.library.find()
    docs = await videos.to_list(None)
    video_urls = ''
    for i in docs:
        filename = i['filename']
        v = f'<a href="{PROTOCOL}://{HOST}:8084/video/stream/{filename}" target="_blank">http://{HOST}/video/stream/{filename}</a>'
        video_urls = video_urls + '<br>' + v
    return video_urls

async def _generate_hash():
    return binascii.hexlify(os.urandom(16)).decode('utf-8')

# TODO: change hash to lesson id as video id

async def _add_library_record(hash: str):
    data = {'filename': hash}
    await app.library.insert_one(data)

async def _upload(file: object, hash: str):
    grid_in = app.fs.open_upload_stream(
        hash, metadata={'contentType': 'video/mp4'})
    data = await file.read()
    await grid_in.write(data)
    await grid_in.close()  # uploaded on close

@app.post('/video/upload')
async def upload(file: UploadFile, background_tasks: BackgroundTasks):
    if file.filename:
        hash = await _generate_hash()
        background_tasks.add_task(_upload, file, '2')
        background_tasks.add_task(_add_library_record, '2')
        videos = await _get_videos()
        return HTMLResponse(f'{views.upload_block}{videos}{views.video_library_block}{views.logout_block}')
    return HTMLResponse(f'<h3>Please select a file to upload</h3>{views.upload_block + views.logout_block}')

@app.get('/video/stream/{filename}')
async def stream(filename: str):
    grid_out = await app.fs.open_download_stream_by_name(filename)
    
    async def read():
        while grid_out.tell() < grid_out.length:
            yield await grid_out.readchunk()

    return StreamingResponse(read(), media_type='video/mp4', 
        headers={'Content-Length': str(grid_out.length)})
