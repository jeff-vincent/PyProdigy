from fastapi import FastAPI
import aiohttp
import logging  # Import the logging module

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)  # Set the logging level as per your requirement
logger = logging.getLogger(__name__)

async def call_userinfo_endpoint(token):
    async with aiohttp.ClientSession() as session:
        headers = {
            'Authorization': f'Bearer {token}'
        }
        async with session.get('https://dev-w5iil6bapqnf2nai.us.auth0.com/userinfo', headers=headers) as response:
            return await response.json()

@app.get("/authenticate/{token}")
async def authenticate(token: str):
    try:
        logger.info(f"Received token: {token}")
        userinfo = await call_userinfo_endpoint(token)
        logger.info(f"User info retrieved: {userinfo}")
        return userinfo
    except Exception as e:
        logger.error(f"Error occurred during authentication: {e}")
        return {"error": "An internal server error occurred"}, 500
