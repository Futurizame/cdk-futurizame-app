import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DomainResources } from "../resources/DomainResources";
import { WebsiteResources } from "../resources/WebsiteResources";

const domain = "futuriza.me";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainResources = new DomainResources(this, "DomainStack", {
      rootStackName: this.stackName,
      domain,
    });

    new WebsiteResources(this, "WebsiteStack", {
      rootStackName: this.stackName,
      domain,
      certificate: domainResources.certificate,
      hostedZone: domainResources.hostedZone,
    });
  }
}
