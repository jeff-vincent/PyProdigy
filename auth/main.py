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
        userinfo = await call_userinfo_endpoint(token)
        logger.info(f"User info retrieved: {userinfo}")
        return userinfo
    except Exception as e:
        logger.error(f"Error occurred during authentication: {e}")
        return {"error": "An internal server error occurred"}, 500


@app.get("/authenticate/get-user-roles/{token}")
async def get_user_roles(token: str):
    userinfo = await call_userinfo_endpoint(token)
    logger.info(f"User info: {userinfo}")
    username = userinfo['sub']
    management_api_token = await fetch_management_api_token()
    headers = {'Authorization': f'Bearer {management_api_token}'}
    logging.info(f'management api token: {management_api_token}')
    async with aiohttp.ClientSession() as session:
        async with session.get(f'https://dev-w5iil6bapqnf2nai.us.auth0.com/api/v2/users/{username}/roles', headers=headers) as response:
            roles_data = await response.json()
            logging.info(f'user roles returned: {roles_data}')
            for role in roles_data:
                if role.get('name') == 'admin':
                    return True
            return False


async def fetch_management_api_token():
    url = "https://dev-w5iil6bapqnf2nai.us.auth0.com/oauth/token"
    payload = {
        "client_id": "tkQPEYIwGpPHxDw7KxaUkCBEGHkRIiGU",
        "client_secret": "",
        "audience": "https://dev-w5iil6bapqnf2nai.us.auth0.com/api/v2/",
        "grant_type": "client_credentials"
    }
    headers = {
        "Content-Type": "application/json"
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            data = await response.json()
            logging.info(data)
            return data.get('access_token')
