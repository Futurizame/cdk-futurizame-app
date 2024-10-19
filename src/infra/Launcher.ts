import * as cdk from "aws-cdk-lib";
import { AppStack } from "./stacks/AppStack";

const service = "futurizame";
const feature = "app";
const stackName = `cdk-${service}-${feature}`;

const app = new cdk.App();

const appStack = new AppStack(app, "AppStack", {
  stackName,
});

cdk.Tags.of(appStack).add("Stack", stackName);
cdk.Tags.of(appStack).add("Service", service);
cdk.Tags.of(appStack).add("Feature", feature);

app.synth();
