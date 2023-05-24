

contextBroker -dbhost fiware-orion_devcontainer-another-service-1:27017 -logLevel DEBUG

curl -X POST \
  'http://localhost:1026/v2/entities' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "Room1",
  "type": "Room",
  "temperature": {
    "value": 23,
    "type": "Number"
  }
}'

curl -X GET 'http://localhost:1026/v2/entities'


