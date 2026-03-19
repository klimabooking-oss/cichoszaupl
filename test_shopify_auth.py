import urllib.request
import base64
import json
import ssl

SHOP_URL = "8bf936-41.myshopify.com"
CLIENT_ID = "c541a99688b8fbe6bdf3c31d5c259f87"
CLIENT_SECRET = "API_SECRET_REMOVED_FOR_SECURITY"

url = f"https://{SHOP_URL}/admin/api/2024-01/blogs.json"

auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
encoded_auth_string = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

req = urllib.request.Request(url, headers={
    "Authorization": f"Basic {encoded_auth_string}",
    "Content-Type": "application/json"
})

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode())
        print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode())
