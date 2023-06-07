import json
from fastapi import FastAPI, BackgroundTasks, UploadFile
from fastapi.responses import StreamingResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# PROTOCOL = os.environ.get('PROTOCOL')
# HOST = os.environ.get('HOST')
# MONGO_HOST = os.environ.get('MONGO_HOST')
# MONGO_PORT = os.environ.get('MONGO_PORT')
# AUTH_HOST = os.environ.get('AUTH_HOST')
# AUTH_PORT = os.environ.get('AUTH_PORT')

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
    return JSONResponse(json.loads(videos))

async def _get_videos():
    videos = app.library.find()
    docs = await videos.to_list(None)
    video_urls = ''
    for i in docs:
        filename = i['filename']
        v = f'<a href="{PROTOCOL}://{HOST}:8084/video/stream/{filename}" target="_blank">http://{HOST}/video/stream/{filename}</a>'
        video_urls = video_urls + '<br>' + v
    return video_urls

async def _add_library_record(lesson_id: str):
    data = {'filename': lesson_id}
    await app.library.insert_one(data)

async def _upload(file: object, lesson_id: str):
    grid_in = app.fs.open_upload_stream(
        lesson_id, metadata={'contentType': 'video/mp4'})
    data = await file.read()
    await grid_in.write(data)
    await grid_in.close()

@app.post('/video/upload/{id}')
async def upload(background_tasks: BackgroundTasks, video: UploadFile, id: int):
    lesson_id = str(id)
    print(video.filename)
    if video.filename:
        background_tasks.add_task(_upload, video, lesson_id)
        background_tasks.add_task(_add_library_record, lesson_id)
        return ''

@app.get('/video/stream/{filename}')
async def stream(filename: str):
    grid_out = await app.fs.open_download_stream_by_name(filename)
    
    async def read():
        while grid_out.tell() < grid_out.length:
            yield await grid_out.readchunk()

    return StreamingResponse(read(), media_type='video/mp4', 
        headers={'Content-Length': str(grid_out.length)})
