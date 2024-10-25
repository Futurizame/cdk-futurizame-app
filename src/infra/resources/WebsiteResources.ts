import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigin from "aws-cdk-lib/aws-cloudfront-origins";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

interface WebsiteResourcesProps extends cdk.NestedStackProps {
  rootStackName: string;
  domain: string;
  certificate: certificateManager.ICertificate;
  hostedZone: route53.IHostedZone;
}

export class WebsiteResources extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: WebsiteResourcesProps) {
    super(scope, id, props);

    const bucketName = `${props.rootStackName}-website-bucket`;
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName,
    });
    cdk.Tags.of(websiteBucket).add("Name", bucketName);

    const websiteFunctionName = `${props.rootStackName}-rewrite`;
    const websiteFunction = new cloudfront.Function(this, "RewriteFunction", {
      functionName: websiteFunctionName,
      code: cloudfront.FunctionCode.fromFile({
        filePath: "src/functions/rewrite.js",
      }),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: "Function to rewrite URLs at request time",
      autoPublish: true,
    });

    const distributionName = `${props.rootStackName}-website-distribution`;
    const distribution = new cloudfront.Distribution(this, "WebsiteDistribution", {
      enabled: true,
      enableIpv6: true,
      comment: `CloudFront distribution for ${bucketName}`,
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: cloudfrontOrigin.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
          originId: "S3Origin",
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          { function: websiteFunction, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      domainNames: [props.domain],
      certificate: props.certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/error/index.html",
        },
      ],
    });
    cdk.Tags.of(distribution).add("Name", distributionName);

    const records = [route53.RecordType.A, route53.RecordType.AAAA];
    records.forEach((recordType) => {
      new route53.RecordSet(this, `WebsiteRecordSet${recordType}`, {
        recordName: props.domain,
        comment: `Record set ${recordType} for ${props.domain}`,
        zone: props.hostedZone,
        recordType: recordType,
        target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
      });
    });
  }
}
