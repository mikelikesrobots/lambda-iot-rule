#!/bin/bash
aws iot-data publish \
    --topic 'robots/FakeRobot/status' \
    --payload '{"name": "FakeRobot", "status": "ONLINE"}' \
    --cli-binary-format raw-in-base64-out
