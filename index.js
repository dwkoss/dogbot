const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Client } = require('@petfinder/petfinder-js');
const Twit = require('twit');

const petfinderApiKeyLoc = process.env.PETFINDER_DOGBOT_API_KEY_LOC;
const petfinderSecretLoc = process.env.PETFINDER_DOGBOT_SECRET_LOC;

const twitterKeyLoc = process.env.TWITTER_DOGBOT_API_KEY_LOC;
const twitterSecretLoc = process.env.TWITTER_DOGBOT_API_SECRET_KEY_LOC;
const twitterAccessTokenLoc = process.env.TWITTER_DOGBOT_ACCESS_TOKEN_LOC;
const twitterAccessTokenSecretLoc = process.env.TWITTER_DOGBOT_ACCESS_TOKEN_SECRET_LOC;

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
  'who will jump for joy upon meeting you!',
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
  // Getting the doggo
  const secretManagerClient = new SecretManagerServiceClient();
  const petfinderApiKey = await getFromSecretManager(secretManagerClient, petfinderApiKeyLoc);
  const petfinderSecret = await getFromSecretManager(secretManagerClient, petfinderSecretLoc);
  const petfinderClient = new Client({ apiKey: petfinderApiKey, secret: petfinderSecret });

  const dogs = await petfinderClient.animal.search({ type: 'dog' });
  const doggo = getRandomArray(getValidDoggos(dogs.data.animals));
  const doggoResponse = {
    doggo,
    text: getDoggoText(doggo),
    photo: doggo.primary_photo_cropped.medium,
    url: doggo.url
  };
  console.log(doggoResponse); // logging doggoResponse to debug when necessary

  // Making the tweet
  const consumerKey = await getFromSecretManager(secretManagerClient, twitterKeyLoc);
  const consumerSecret = await getFromSecretManager(secretManagerClient, twitterSecretLoc);
  const accessToken = await getFromSecretManager(secretManagerClient, twitterAccessTokenLoc);
  const accessTokenSecret = await getFromSecretManager(
    secretManagerClient, twitterAccessTokenSecretLoc,
  );

  const twitClient = new Twit({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: accessToken,
    access_token_secret: accessTokenSecret,
  });

  const tweetText = `${doggoResponse.doggoText} ${doggoResponse.url}`

  if (!doggoResponse.doggoText) {
    console.log('no tweet was generated because the doggo text is wrong');
    res.send({
      doggo,
      doggoText: doggoText,
      photo: doggo.primary_photo_cropped.medium,
      url: doggo.url
    });
  } else if (parsedBody.noExecuteTweet) {
    res.send({
      tweetText,
    });
  } else {
    const tweetResponse = await twitClient.post('statuses/update', { status: tweetText });

    res.send({
      tweetText,
      tweetResponse,
    });
  }
};
