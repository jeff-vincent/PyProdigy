from fastapi import FastAPI
import aiohttp

app = FastAPI()


async def call_userinfo_endpoint(token):
    async with aiohttp.ClientSession() as session:
        headers = {
            'Authorization': f'Bearer {token}'
        }
        async with session.get('https://dev-w5iil6bapqnf2nai.us.auth0.com/userinfo', headers=headers) as response:
            return await response.json()


@app.get("/authenticate/{token}")
async def authenticate(token: str):
    userinfo = await call_userinfo_endpoint(token)
    return userinfo
