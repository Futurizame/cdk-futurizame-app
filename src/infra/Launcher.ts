import * as cdk from "aws-cdk-lib";
import { CoreStack } from "./stacks/CoreStack";

const app = new cdk.App();

const coreStack = new CoreStack(app, "CoreStack", {
  stackName: "cdk-futurizame-core",
});
cdk.Tags.of(coreStack).add("Stack", "cdk-futurizame-core");
cdk.Tags.of(coreStack).add("Domain", "futurizame");
cdk.Tags.of(coreStack).add("Feature", "core");

app.synth();
