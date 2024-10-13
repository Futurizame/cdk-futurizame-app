import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigin from "aws-cdk-lib/aws-cloudfront-origins";

export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = cdk.Fn.sub("${AWS::StackName}-website-bucket");
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName,
    });
    cdk.Tags.of(websiteBucket).add("Name", bucketName);

    const oacName = cdk.Fn.sub("${AWS::StackName}-website-oac");
    const oac = new cloudfront.S3OriginAccessControl(this, "WebsiteOAC", {
      originAccessControlName: oacName,
      description: `S3 Origin Access Control for ${bucketName}`,
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });
    cdk.Tags.of(oac).add("Name", oacName);

    const origin = new cloudfrontOrigin.S3StaticWebsiteOrigin(websiteBucket, {
      originAccessControlId: oac.originAccessControlId,
    });

    const distributionName = cdk.Fn.sub("${AWS::StackName}-website-distribution");
    const distribution = new cloudfront.Distribution(this, "WebsiteDistribution", {
      comment: `CloudFront distribution for ${bucketName}`,
      defaultBehavior: {
        origin,
      },
      enabled: true,
      enableIpv6: true,
    });
    cdk.Tags.of(distribution).add("Name", distributionName);
  }
}
