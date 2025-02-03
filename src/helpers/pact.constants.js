export const PACT_OPTIONS_BFF = {
    "consumer": process.env.REACT_APP_PACT_CONSUMER_NAME,
    "logLevel": process.env.REACT_APP_PACT_PROVIDER_LOGLEVEL,
    "port": process.env.REACT_APP_PACT_PROVIDER_PORT,
    "provider": process.env.REACT_APP_PACT_PROVIDER_NAME

    /*
     * Log: path.resolve(process.cwd(), process.env.mockProvider.log.filename),
     * dir: path.resolve(process.cwd(), process.env.pactFolder),
     */
    // Spec: process.env.mockProvider.spec
};
