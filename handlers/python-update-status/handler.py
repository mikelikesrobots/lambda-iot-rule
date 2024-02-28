import boto3
import os

ALLOWED_STATUSES = ["ONLINE"]
def lambda_handler(event, context):
    table_name = os.environ.get("TABLE_NAME")
    if table_name is None:
        raise RuntimeError("Environment variable 'TABLE_NAME' must be set!")

    name = str(event["name"])
    status = str(event["status"])
    if status not in ALLOWED_STATUSES:
        raise RuntimeError(
            "Status {} not allowed! Allowed statuses: {}".format(
                status, ALLOWED_STATUSES
            )
        )
    print("Event received. Robot: {}; status: {}".format(name, status))

    ddb = boto3.resource("dynamodb")
    table = ddb.Table(table_name)
    table.update_item(
        Key={"name": name},
        AttributeUpdates={
            "status": {
                "Value": status
            }
        },
        ReturnValues="UPDATED_NEW",
    )
