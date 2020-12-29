const { CommunicationIdentityClient } = require('@azure/communication-administration');

const main = async () => {
    console.log("Azure Communication Services - Access Tokens Quickstart")

    // This code demonstrates how to fetch your connection string
    // from an environment variable.
    const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];

    // Instantiate the identity client
    const identityClient = new CommunicationIdentityClient(connectionString);

    let identityResponse = await identityClient.createUser();
    console.log('\nCreated an identity with ID: ', identityResponse.communicationUserId);

    // Issue an access token with the "chat" scope for an identity
    let tokenResponse = await identityClient.issueToken(identityResponse, ["chat"]);
    const { token, expiresOn } = tokenResponse;
    console.log('\nIssued an access token with \'chat\' scope that expires at', expiresOn);
    console.log(token);
};

main().catch((error) => {
  console.log("Encountered an error");
  console.log(error);
})