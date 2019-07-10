import requests
import time
import random

# Authentication as a wearable participant
auth_token='jGGWgffXKUgPBZzAQ37BQ99qxQkwXcrBtAghfC6BXwnUflel7WIibPnbq0HuNIta'
header = {'X-Access-Token': auth_token}

url = 'http://localhost:3000/api/wallet/wearable%40healthcare-network/setDefault'
response_auth = requests.post(url, headers=header)

if(response_auth.status_code == 204):
    print("** Wearable was succesfully authenticated **")
else:
    print("** Error authenticating wearable")

pedometer = 0
calories = 0
heartbeat_max = 180
hearbeat_min = 50

def getHeartbeat():
    return (random.randint(hearbeat_min, heartbeat_max));

while True:
# Send wearable data
    url = "http://localhost:3000/api/SendWearableData"
    data = {
        "$class": "org.healthcare.com.SendWearableData",
        "pedometer": pedometer,
        "calories": calories,
        "heartbeat": getHeartbeat(),
        "owner": "resource:org.healthcare.com.Patient#b39024efbc6de61976f585c8421c6bba",
        "device": "resource:org.healthcare.com.Wearable#27c316cf678cc9683cee96b29595dab3"
    }
    response_send = requests.post(url, json=data,  headers=header)

    if (response_send.status_code == 200):
        print("** Sending data --> Heartbeat: {}").format(data.get("heartbeat"))
        print("** Sending data --> Pedometer: {}").format(data.get("pedometer"))
        print("** Sending data --> Calories: {}").format(data.get("calories"))
        print
        time.sleep(3)
        pedometer = pedometer + 25
        calories = calories + 1
    else:
        print("** Error while sending data **")
