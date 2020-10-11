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

const getValidDoggos = (animals) => animals.filter((animal) => animal.type === 'Dog'
  && animal.status === 'adoptable'
  && animal.name
  && animal.gender
  && animal.colors && animal.colors.primary
  && animal.breeds && animal.breeds.primary
  && animal.primary_photo_cropped && animal.primary_photo_cropped.medium);

const getRandomArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

const agnosticCompliments = ['classy', 'good-looking', 'elegant', 'majestic', 'smart', 'cool', 'delightful', 'knockout', 'superb'];
const girlCompliments = ['beautiful', 'pretty', 'graceful', 'foxy', 'devine', 'lovely', 'stunning', ...agnosticCompliments];
const boyCompliments = ['handsome', 'sharp', 'dapper', 'suave', 'hunky', 'studly', 'lady killer', 'slick', ...agnosticCompliments];

const lookingFor = [
  'whose looking for their forever home!',
  'who wants a new mom or dad!',
  'who wants to give you a kiss!',
  'who wants to sit for you!',
  'who wants a booty rub from you.',
  'who will jump for joy when they meet you!',
  'who wants to give you all the cuddles!',
  'who will just warm your heart!',
  'who will bring much joy to your home!',
];

const getDoggoText = (doggo) => {
  const complimentStr = doggo.gender === 'Female'
    ? getRandomArray(girlCompliments)
    : getRandomArray(boyCompliments);
  const genderStr = doggo.gender === 'Female' ? 'girl' : 'boy';
  const breedStr = doggo.breeds.secondary ? `${doggo.breeds.primary} / ${doggo.breeds.secondary}` : doggo.breeds.primary;
  const breedMixStr = doggo.breeds.mixed ? `${breedStr} mix` : doggo.breeds.primary;
  return `${doggo.name} is a ${complimentStr} ${genderStr}! ${doggo.name} is a ${breedMixStr}, ${getRandomArray(lookingFor)}`;
}

exports.run = async (req, res) => {
  const secretManagerClient = new SecretManagerServiceClient();
  const petfinderApiKey = await getFromSecretManager(secretManagerClient, petfinderApiKeyLoc);
  const petfinderSecret = await getFromSecretManager(secretManagerClient, petfinderSecretLoc);
  const petfinderClient = new Client({ apiKey: petfinderApiKey, secret: petfinderSecret });

  const dogs = await petfinderClient.animal.search({ type: 'dog' });
  const doggo = getRandomArray(getValidDoggos(dogs.data.animals));
  res.send({text: getDoggoText(doggo), photo: doggo.primary_photo_cropped.medium, url: doggo.url});
};
