import urllib.request
import urllib.error
import json
import ssl

SHOP_URL = "8bf936-41.myshopify.com"
ACCESS_TOKEN = "API_SECRET_REMOVED_FOR_SECURITY"
url = f"https://{SHOP_URL}/admin/api/2024-01/blogs.json"

req = urllib.request.Request(url, headers={
    "X-Shopify-Access-Token": ACCESS_TOKEN,
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
