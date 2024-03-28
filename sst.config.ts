/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-repro-2",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const GoogleClientId = new sst.Secret("GoogleClientId");
    const GoogleClientSecret = new sst.Secret("GoogleClientSecret");
    const NeonDatabaseUrl = new sst.Secret("NeonDatabaseUrl");
    const SendgridApiKey = new sst.Secret("SendgridApiKey");
    const OpenApiKey = new sst.Secret("OpenApiKey");
    const AuthSecret = new sst.Secret("AuthSecret");
    const ClerkPublishableKey = new sst.Secret("ClerkPublishableKey");
    const ClerkSecretKey = new sst.Secret("ClerkSecretKey");

    const hostedZone = getHostedZone();
    const domain = getDomain();

    const bookEmbeddingQueue = new sst.aws.Queue("BookEmbeddingQueue", {
      transform: {
        queue(args) {
          return {
            ...args,
            visibilityTimeoutSeconds: 900,
          };
        },
      },
    });
    bookEmbeddingQueue.subscribe({
      handler: "packages/functions/src/consumeBookEmbeddingQueue/handler.main",
      link: [OpenApiKey, NeonDatabaseUrl],
      timeout: "900 seconds",
    });

    const bucket = new sst.aws.Bucket("MarcFiles");

    const marcRecordQueue = new sst.aws.Queue("MarcRecordQueue", {
      transform: {
        queue(args) {
          return {
            ...args,
            visibilityTimeoutSeconds: 900,
          };
        },
      },
    });
    marcRecordQueue.subscribe({
      handler: "packages/functions/src/consumeMarcFileQueue/handler.main",
      link: [bucket, NeonDatabaseUrl],
      timeout: "900 seconds",
    });

    new sst.aws.Nextjs("LMS", {
      path: "packages/lms",
      link: [
        AuthSecret,
        GoogleClientId,
        GoogleClientSecret,
        NeonDatabaseUrl,
        SendgridApiKey,
        bookEmbeddingQueue,
        bucket,
        marcRecordQueue,
      ],
      environment: {
        AUTH_SECRET: AuthSecret.value,
        NEXT_PUBLIC_TOP_SITE_URL: getSiteUrl("top"),
        NEXT_PUBLIC_OPAC_SITE_URL: getSiteUrl("opac"),
      },
      domain: {
        hostedZone,
        domainName: getSiteDomain("lms"),
      },
    });

    new sst.aws.Nextjs("OPAC", {
      path: "packages/opac",
      link: [NeonDatabaseUrl],
      environment: {
        NEXT_PUBLIC_TOP_SITE_URL: getSiteUrl("top"),
        NEXT_PUBLIC_LMS_SITE_URL: getSiteUrl("lms"),
      },
      domain: {
        hostedZone,
        domainName: getSiteDomain("opac"),
      },
    });

    new sst.aws.Nextjs("Top", {
      path: "packages/top",
      link: [ClerkPublishableKey, ClerkSecretKey, NeonDatabaseUrl],
      environment: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ClerkPublishableKey.value,
        CLERK_SECRET_KEY: ClerkSecretKey.value,
        NEXT_PUBLIC_OPAC_SITE_URL: getSiteUrl("opac"),
        NEXT_PUBLIC_LMS_SITE_URL: getSiteUrl("lms"),
      },
      domain: {
        hostedZone,
        domainName: getSiteDomain("top"),
      },
    });

    return {
      topUrl: getSiteUrl("top"),
      lmsUrl: getSiteUrl("lms"),
      opacUrl: getSiteUrl("lms"),
      bucketName: bucket.name,
      marcQueueUrl: marcRecordQueue.url,
      embeddingQueueUrl: bookEmbeddingQueue.url,
    };
  },
});

function getHostedZone() {
  switch ($app.stage) {
    case "production":
      return "stacks-ils.com";
    default:
      return `dev.stacks-ils.com`;
  }
}

function getDomain() {
  switch ($app.stage) {
    case "production":
      return "stacks-ils.com";
    case "staging":
      return "dev.stacks-ils.com";
    default:
      return `${$app.stage}.dev.stacks-ils.com`;
  }
}

function getSiteDomain(site: "top" | "lms" | "opac") {
  const domain = getDomain();
  switch (site) {
    case "top":
      return domain;
    case "lms":
      return `app.${domain}`;
    case "opac":
      return `opac.${domain}`;
  }
}

function getSiteUrl(site: "top" | "lms" | "opac") {
  if ($dev) {
    switch (site) {
      case "top":
        return `http://localhost:3000`;
      case "lms":
        return `http://localhost:3002`;
      case "opac":
        return `http://localhost:3001`;
      default:
        throw new Error("Invalid site");
    }
  } else {
    const domain = getSiteDomain(site);
    return `https://${domain}`;
  }
}
