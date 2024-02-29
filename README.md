# Robot Status Table

This is an example project to demonstrate how a Lambda function can be used to manage entries in a DynamoDB table.

The example use case is a robot coming online and sending an MQTT message that will trigger a Lambda function. The function then updates the table with the robot's status, inserting a new row for the robot if necessary. This table can then be used to list any robots that have been connected to the table and their current status.

There are two handler functions which perform identical tasks. One is written in Python, and the other in Rust. This is to allow the user to explore the effects of using a compiled versus an interpreted language on time taken, memory used, and cost. 

## Installing Tools

The tools required are CDK and the Cargo package manager. These can be installed as follows:

To install CDK, first install NodeJS ([more instructions](https://nodejs.org/en/download/package-manager)), then execute:

```bash
npm install -g aws-cdk
```

TODO install gcc - yum install gcc should be fine

To install Cargo, go to [Rustup](https://rustup.rs/) and follow the installation instructions. Once complete, install `gcc` and the Cargo Lambda plugin to be able to build the Rust Lambda function. An example for AL2/CentOS systems is:

```bash
sudo yum install -y gcc
cargo install cargo-lambda
```

## Build and Deploy

Make sure you have AWS credentials activated on your account. You can build and deploy with one command:

```bash
npm run deploy
```

Note that this is not the standard `cdk deploy` command - that's because this deploy contains an extra step of compiling the Rust code to a zip file suitable for upload to Lambda.

Once the deployment is ready, it will prompt for permission to continue - enter 'y' and allow it to deploy.

## Test the functions

For any test, a suitable JSON document has the form:

```json
{
    "name": "YourNameHere",
    "status": "ONLINE",
}
```

You can test the functions in a few ways:
1. Go to the console and find the Lambda functions in the Lambda service section. For each, go to the Test section and enter a suitable JSON document, then click save and test. The test should be successful, with a new entry appearing in the DynamoDB table.
2. Go to the IoT Core page and click on the MQTT Test Client. Publish a message to a topic like `robots/YourNameHere/status` with a suitable JSON document. This should cause a new entry to appear in DynamoDB.
3. Use the test script. Within the scripts folder of this repository, execute the `send_mqtt.sh` script, which is the equivalent of performing step 2.

## Teardown

Once your testing is complete, the stack can be removed by executing `cdk destroy` and agreeing with the confirmation prompt.
