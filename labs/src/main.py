import os
from typing import Annotated, List, Optional
from fastapi import Depends, FastAPI, File, HTTPException, status, Request
from fastapi.responses import JSONResponse
from pymongo import AsyncMongoClient
from bson import ObjectId

from middleware import TokenValidationMiddleware

app = FastAPI()
app.add_middleware(TokenValidationMiddleware)

MONGO_HOST = os.environ.get('MONGO_HOST')
MONGO_PORT = os.environ.get('MONGO_PORT')


@app.on_event('startup')
async def get_mongo():
    labs_db = AsyncMongoClient(f'mongodb://{MONGO_HOST}:{MONGO_PORT}').labs
    app.labs = labs_db.labs


# def require_roles(request: Request, allowed_roles: List[str]):
#     user_info = request.state.user_info
#     if user_info.get("role") not in allowed_roles:
#         raise HTTPException(status_code=403, detail="Forbidden: insufficient role")


@app.get('/labs')
async def get_labs_by_org_id(request: Request):
    org_id = request.state.user_info['org_id']
    labs = app.labs.find({"org_id": org_id})
    result = await labs.to_list(None)
    for lab in result:
        lab['_id'] = str(lab['_id'])
    return result


@app.get('/labs/lab')
async def get_lab(request: Request):
    org_id = request.state.user_info['org_id']
    lab_id = request.state.user_info.get('lab_id')
    if not lab_id:
        raise HTTPException(status_code=400, detail="Lab ID is required")

    if not ObjectId.is_valid(lab_id):
        raise HTTPException(status_code=400, detail="Invalid lab ID")

    lab = await app.labs.find_one({"_id": ObjectId(lab_id), "org_id": org_id})
    if lab is None:
        raise HTTPException(status_code=404, detail="Lab not found")

    lab['_id'] = str(lab['_id'])
    return lab


@app.post('/labs/lab', status_code=status.HTTP_201_CREATED)
async def create_lab(request: Request):
    # require_roles(request, ["admin", "maintainer"])

    payload = await request.json()
    org_id = request.state.user_info['org_id']
    if not org_id:
        raise HTTPException(status_code=401, detail="Unauthorized: org_id is required")

    # required_fields = ['title', 'description']
    # for field in required_fields:
    #     if field not in payload:
    #         raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    lab_data = {
        # Required fields
        'org_id': org_id,
        'name': payload['name'],
        'container_image': payload['container_image'],
        'elements': payload['elements'],
        # Optional fields
        'script_name': payload.get('script_name', ''),
        'execution_command': payload.get('execution_command', ''),
        'lab_text': payload.get('lab_text', ''),
        'example_code': payload.get('example_code', ''),
        'terminal_commands': payload.get('terminal_commands', ''),
    }

    result = await app.labs.insert_one(lab_data)
    created_lab = await app.labs.find_one({"_id": result.inserted_id})
    created_lab['_id'] = str(created_lab['_id'])
    return created_lab


@app.put('/labs/lab/{lab_id}')
async def update_lab(request: Request, lab_id: str):
    # require_roles(request, ["admin", "maintainer"])
    org_id = request.state.user_info['org_id']
    if not org_id:
        raise HTTPException(status_code=401, detail="Unauthorized: org_id is required")

    if not ObjectId.is_valid(lab_id):
        raise HTTPException(status_code=400, detail="Invalid lab ID")

    payload = await request.json()
    allowed_fields = ['org_id', 'name', 'elements', 'lab_text', 'example_code', 'terminal_commands']
    update_data = {k: v for k, v in payload.items() if k in allowed_fields and v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await app.labs.update_one(
        {"_id": ObjectId(lab_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lab not found")

    updated_lab = await app.labs.find_one({"_id": ObjectId(lab_id)})
    updated_lab['_id'] = str(updated_lab['_id'])
    return updated_lab


# @app.delete('/labs/{lab_id}', status_code=status.HTTP_204_NO_CONTENT)
# async def delete_lab(request: Request, lab_id: str):
#     require_roles(request, ["admin"])

#     if not ObjectId.is_valid(lab_id):
#         raise HTTPException(status_code=400, detail="Invalid lab ID")

#     result = await app.labs.delete_one({"_id": ObjectId(lab_id)})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Lab not found")

#     return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)
