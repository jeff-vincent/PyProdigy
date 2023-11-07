from fastapi import FastAPI, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
import requests
import logging


class TokenValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            # Return a 401 response if the Authorization header is missing
            response_content = {'detail': 'Authorization header missing'}
            return JSONResponse(content=response_content, status_code=401)

        # # Validate the token using your authentication service or cache
        # # For simplicity, let's assume you have a function validate_token(token) that returns user information if valid
        user_info = requests.get(f'http://auth-api:8000/authenticate/{token}')
        try:
            if user_info.json()[0]['error']:
                # Return a 401 response if the token is invalid or expired
                response_content = {'detail': 'Invalid or expired token'}
                return JSONResponse(content=response_content, status_code=401)
        except:
            pass
        #
        # # Attach user information to the request for downstream route handlers to use
        local_user = requests.get(f'http://users:8000/api/get-user-by-sub/{user_info.json()["sub"]}')
        request.state.user_info = local_user.json()['id']

        response = await call_next(request)
        return response
