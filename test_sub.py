import requests

data = {
    "admin_name": "John Doe",
    "admin_email": "johndoe@example.com",
    "org_name": "Example Organization",
    "security_notifications": True,
    "newsletter": False,
}
req = requests.post("https://datareporter.com/subscribe", json=data)
print(req)
