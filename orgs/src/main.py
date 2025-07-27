import os
from typing import Annotated, List, Optional
from fastapi import Depends, FastAPI, File, HTTPException, status, Request
from fastapi.responses import JSONResponse
from pymongo import AsyncMongoClient
from bson import ObjectId
import aiohttp

from middleware import TokenValidationMiddleware

app = FastAPI()
app.add_middleware(TokenValidationMiddleware)

MONGO_HOST = os.environ.get('MONGO_HOST')
MONGO_PORT = os.environ.get('MONGO_PORT')


@app.on_event('startup')
async def get_mongo():
    orgs_db = AsyncMongoClient(f'mongodb://{MONGO_HOST}:{MONGO_PORT}').orgs
    app.orgs = orgs_db.orgs

@app.get('/orgs')
async def get_labs_by_org_id(request: Request):
    org_id = request.state.user_info['org_id']
    labs = app.labs.find({"org_id": org_id})
    result = await labs.to_list(None)
    for lab in result:
        lab['_id'] = str(lab['_id'])
    return result

@app.get('/orgs/org')
async def get_org(request: Request):
    """Get org details based on the org_id in the token."""
    org_id = request.state.user_info['org_id']
    org = await app.orgs.find_one({"org_id": org_id})
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found")

    org['_id'] = str(org['_id'])
    return org

@app.post('/orgs/org', status_code=status.HTTP_201_CREATED)
async def create_org(request: Request):
    """Create a new organization."""
    org_id = request.state.user_info['org_id']
    org_data = await request.json()
    org_data['org_id'] = org_id # Ensure org_id is set from the token   
    result = await app.orgs.insert_one(org_data)
    if result.acknowledged:
        org_data['_id'] = str(result.inserted_id)
        # TODO: Check for namespace in compute service
        # await create_namespace(org_id)  # Assuming a function to create a namespace in the compute service
        return JSONResponse(content=org_data, status_code=status.HTTP_201_CREATED)
    else:
        raise HTTPException(status_code=500, detail="Failed to create organization")

@app.put('/orgs/org', status_code=status.HTTP_200_OK)
async def update_org(request: Request):
    """Update organization details."""
    org_id = request.state.user_info['org_id']
    org_data = await request.json()
    result = await app.orgs.update_one({"org_id": org_id}, {"$set": org_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found or no changes made")
    
    return JSONResponse(content={"message": "Organization updated successfully"}, status_code=status.HTTP_200_OK)

@app.delete('/orgs/org', status_code=status.HTTP_204_NO_CONTENT)
async def delete_org(request: Request):
    """Delete an organization."""
    org_id = request.state.user_info['org_id']
    result = await app.orgs.delete_one({"org_id": org_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return JSONResponse(content={"message": "Organization deleted successfully"}, status_code=status.HTTP_204_NO_CONTENT)
