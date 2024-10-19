import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";

interface DomainResourcesProps extends cdk.NestedStackProps {
  rootStackName: string;
  domain: string;
}

export class DomainResources extends cdk.NestedStack {
  public hostedZone: route53.PublicHostedZone;
  public certificate: certificateManager.Certificate;

  constructor(scope: Construct, id: string, props: DomainResourcesProps) {
    super(scope, id, props);

    const hostedZoneName = `${props.rootStackName}-hosted-zone`;
    const hostedZone = new route53.PublicHostedZone(this, "FuturizameHostedZone", {
      zoneName: props.domain,
      comment: `Hosted zone for ${props.domain}`,
    });
    cdk.Tags.of(hostedZone).add("Name", hostedZoneName);
    cdk.Tags.of(hostedZone).add("Domain", props.domain);

    const certificateName = `${props.rootStackName}-certificate`;
    const certificate = new certificateManager.Certificate(this, "FuturizameCertificate", {
      certificateName,
      domainName: `*.${props.domain}`,
      subjectAlternativeNames: [props.domain],
      validation: certificateManager.CertificateValidation.fromDns(hostedZone),
    });
    cdk.Tags.of(certificate).add("Name", certificateName);

    this.hostedZone = hostedZone;
    this.certificate = certificate;
  }
}
