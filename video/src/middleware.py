from fastapi import FastAPI, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
import jwt

# Hardcoded secrets with key IDs
SECRET_KEYS = {
    "key-2025-07-22": "supersecretkey1",
    "key-2025-07-15": "supersecretkey0",
}

class TokenValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JSONResponse(
                content={'detail': 'Authorization header missing'},
                status_code=400
            )

        try:
            # header = jwt.get_unverified_header(token)
            # key_id = header.get("kid")
            # if not key_id or key_id not in SECRET_KEYS:
            #     return JSONResponse(
            #         content={'detail': 'Invalid or unknown key ID'},
            #         status_code=401
            #     )

            # secret = SECRET_KEYS[key_id]
            # payload = jwt.decode(token, secret, algorithms=["HS256"])

            payload = jwt.decode(token, options={"verify_signature": False})  # Temporarily disable signature verification for demo

            org_id = payload.get("org_id")
            print(f"Decoded payload: {payload}")
            user_id = payload.get("user_id")
            lab_id = payload.get("lab_id")
            # if not org_id or not user_id or not lab_id:
            #     return JSONResponse(
            #         content={'detail': 'Invalid token claims'},
            #         status_code=401
            #     )

            # Attach to request state for downstream use
            request.state.user_info = {
                "org_id": org_id,
                # "user_id": user_id,
                "lab_id": lab_id
            }

        except Exception as e:
            return JSONResponse(
                content={'detail': 'Invalid token'},
                status_code=403
            )

        response = await call_next(request)
        return response
