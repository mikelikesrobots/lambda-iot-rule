# Robot Status Table

This is an example project to demonstrate how a Lambda function can be used to manage entries in a DynamoDB table.

The example use case is a robot coming online and sending an MQTT message that will trigger a Lambda function. The function then updates the table with the robot's status, inserting a new row for the robot if necessary. This table can then be used to list any robots that have been connected to the table and their current status.

There are two handler functions which perform identical tasks. One is written in Python, and the other in Rust. This is to allow the user to explore the effects of using a compiled versus an interpreted language on time taken, memory used, and cost. 

## Installing Tools

The tools required are CDK and the Cargo package manager. These can be installed as follows:

To install CDK, first install NodeJS ([more instructions](https://nodejs.org/en/download/package-manager)). AL2 systems can install using `sudo yum install npm`. Then execute:

```bash
sudo npm install -g aws-cdk
```

To install the Rust dependencies, you will require Rust (use [Rustup](https://rustup.rs/)) and Cargo Lambda. Cargo Lambda may be installed in several ways, but the easiest is with Pip. For an AL2 system, this can be accomplished with:

```bash
# Install rust with default options
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Add to current shell
source "$HOME/.cargo/env"
# Install Python's package manager
sudo yum install -y python3-pip
# Install Cargo Lambda
pip3 install cargo-lambda
# Install gcc for linking
sudo yum install -y gcc
```

## Clone the package

If you haven't already, you can clone this package using:

```bash
# Install git if not present
sudo yum install -y git
# Clone package
git clone https://github.com/mikelikesrobots/lambda-iot-rule
```

## Build and Deploy

First, make sure you have AWS credentials activated on your account. You can then build the package by entering the directory, installing dependencies, and running the deploy command, as follows:

```bash
cd path/to/lambda-iot-rule
npm install
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
