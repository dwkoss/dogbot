const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Client } = require('@petfinder/petfinder-js');

const petfinderApiKeyLoc = process.env.PETFINDER_DOGBOT_API_KEY_LOC;
const petfinderSecretLoc = process.env.PETFINDER_DOGBOT_SECRET_LOC;

const getFromSecretManager = async (client, name) => {
  const [version] = await client.accessSecretVersion({
    name: `${name}/versions/latest`,
  });
  return version.payload.data.toString();
};

exports.run = async (req, res) => {
  const secretManagerClient = new SecretManagerServiceClient();
  const petfinderApiKey = await getFromSecretManager(secretManagerClient, petfinderApiKeyLoc);
  const petfinderSecret = await getFromSecretManager(secretManagerClient, petfinderSecretLoc);
  const petfinderClient = new Client({ apiKey: petfinderApiKey, secret: petfinderSecret });

  const dogs = await petfinderClient.animal.search({ type: 'dog' });

  res.send(dogs.data.animals);
};
