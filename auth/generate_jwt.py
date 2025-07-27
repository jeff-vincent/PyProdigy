import jwt
from datetime import datetime, timedelta, timezone

# Define the payload
payload = {
    "org_id": 'org_M5MqFBrXIe54kzI9',
    "org_name": "Some Fancy Company",
    # TODO: dynaimcally set user_id
    "user_id": "demo-environment",
    "lab_id": '68866c41c6c7b78ccf975b30',
    "exp": datetime.now(timezone.utc) + timedelta(minutes=300000),  # Expiration time
    "iat": datetime.now(timezone.utc)  # Issued at time
}

# Define the secret key
secret_key = "supersecretkey1"
key_id = "key-2025-07-22"

# Define the algorithm
algorithm = "HS256"

# Encode the JWT
encoded_jwt = jwt.encode(payload, secret_key, algorithm=algorithm, headers={"kid": key_id})

print(encoded_jwt)


# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOjEyMywib3JnX25hbWUiOiJTb21lIEZhbmN5IENvbXBhbnkiLCJ1c2VyX2lkIjoidXNlcl8xMjMiLCJsYWJfaWQiOjEsImV4cCI6MTc1MzE2NDg2MywiaWF0IjoxNzUzMTYzMDYzfQ.NkZMs2jGzzNqpOcBxoR8toO8abtrYnoXJRdnSVGM1g0