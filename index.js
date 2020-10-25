const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Client } = require('@petfinder/petfinder-js');
const Twit = require('twit');
const imageToBase64 = require('image-to-base64');

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
  // && animal.colors && animal.colors.primary
  && animal.breeds && animal.breeds.primary
  && animal.primary_photo_cropped && animal.primary_photo_cropped.medium
  && animal.contact && animal.contact.address
    && animal.contact.address.city && animal.contact.address.state);

const getRandomArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

// We could use tags, but the api response seems to always return an empty list.
// Oh well! They're all good boys and girls.
const agnosticCompliments = [
  'a classy',
  'a good-looking',
  'an elegant',
  'a majestic',
  'a smart',
  'a cool',
  'a delightful',
  'a knockout',
  'a superb',
  'a civilized',
  'an adventurous',
  'an affectionate',
  'a bright young',
  'a charming',
  'a compassionate',
  'an absolute unit of a',
  'a courageous',
  'an enthusiastic',
  'a happy',
  'a loyal',
  'a resourceful',
  'a sincere',
  'a witty',
  'a sleek',
  'a brave',
  'a courageous',
  'a dynamic',
  'an easygoing',
  'an energetic',
  'a friendly',
  'a gentle spirit of a',
  'a humorous',
  'an independent',
  'a hardworking',
  'an intuitive',
  'a kind',
  'a modest',
  'a placid',
  'a quick-witted',
  'a reserved',
  'a sensible',
  'a sensitive',
];
const girlCompliments = [
  'a beautiful',
  'a pretty',
  'a graceful',
  'a foxy',
  'a devine',
  'a lovely',
  'a stunning',
  ...agnosticCompliments,
];
const boyCompliments = [
  'a handsome',
  'a sharp',
  'a dapper',
  'a suave',
  'a hunky',
  'a studly',
  'a lady killer',
  'a slick',
  ...agnosticCompliments,
];

const agnosticLabels = [
  'doggo',
  'pup',
  'hound',
  'pooch',
  'mutt',
  'doggy',
  'flea bag',
  'punk',
];

const girlLabels = [
  'lady',
  'girl',
  'dame',
  'princess',
  'lass',
  'chick',
  'señorita',
  'woman',
  'gal',
  'broad',
  'sister',
  'damsel',
  'maiden',
  ...agnosticLabels,
];

const boyLabels = [
  'boy',
  'lad',
  'guy',
  'man',
  'señior',
  'dude',
  'gentleman',
  'prince',
  'bloke',
  'chap',
  ...agnosticLabels,
];

const lookingFor = [
  'who\'s looking for their forever home!',
  'who wants a new mom or dad!',
  'who wants to give you a kiss!',
  'who wants to sit for you!',
  'who wants a booty rub from you.',
  'who will jump for joy upon meeting you!',
  'who wants to give you all the cuddles!',
  'who will just melt your heart!',
  'who will bring much joy to your home!',
  'who would like a treat now please.',
  'who will cuddle your face off.',
  'who volunteers at local food shelters.',
  'who loves pretty much everyone!!',
  'who enjoys laying in sunbeams.',
  'who will never stop zooming.',
  'who enjoys second breakfast.',
  'who enjoys wine and book clubs.',
  'who enjoys long walks on the beach.',
  'who would like the sandwich that you\'re eating.',
  'who cant wait to fart in your bed.',
  'who enjoys taking up three quarters of the couch while taking naps.',
  'who takes birthdays very seriously.',
  'who enjoys musicals more than any other medium.',
  'who is tired of waiting in line for sunday brunch.',
  'who is career oriented, and will have time for you after 6pm.',
  'who may or may not have extra toes.',
  'who hates relaxing on vacations.',
  'who enjoys sightseeing, even if unable to see particularly far.',
  'who likes pooping at inconvenient times. Always outside though.',
  'who hates people who do crossfit.',
  'who loves daytime television.',
  'who will not be available on Sundays during Football season.',
  'who is absolutely obsessed with tennis balls.',
  'who is loves listening to podcasts while on their walks.',
  'who will probably not help with too many chores around the house.',
  'who will be super protective for all the moms and dads.',
  'who would like to have a slice of that pizza pie.',
  'who may or may not have an oedipus complex.',
  'who just cant even.',
  'who lacks all sense for personal space.',
  'who cant start their day before a morning coffee.',
  'who has way too much energy in the morning.',
  'who cant seem to ever find anything to watch on the 5 streaming services that they subscribe to.',
  'who\'s spirit animal is a kitty cat.',
  'who enjoys scooting on the carpet, and the sidewalk, and the driveway, and the hardwood.',
  'who enjoys practicing the viola at odd hours.',
  'who clucks like a chicken whenever there might be intruders around.',
  'who is an advocate for recycling paper, plastic, and aluminum.',
  'who thinks that drinking water is underrated.',
  'who ocasionally enjoys howling at the moon.',
  'who enjoys nothing more than an afternoon snoo.',
  'who thinks that they\'re a pretty big deal.',
  'who doesnt really like long term commitments.',
  'who loves going on incredible adventures!',
  'who is excited to adopt you!',
  'who cant wait to be your pumpkin pie!',
  'who gets startled by shadows.',
  'who tries their best at all the things!',
  'who enjoys listening to podcasts while on their walk.',
  'who\'s a wine by day, whiskey by night type of dog.',
  'who just wants to be the good cop to your bad cop.',
  'who\'s not looking for anything serious.',
  'who cant decide between going out and staying in.',
  'who suffers from extreme FOMO.',
  'who doesnt speak English particulaarly well.',
  'who\'s looking for someone who doesn\'t take themselves too seriously',
  'who enjoys sunday trips to the farmers market!!',
  'who enjoys pumpkin spice everything.',
  'who does their own stunt work.',
  'who enjoys taking care of others.',
];

const defaultHashTags = [
  '#dogsoftwitter',
  '#rescue',
  '#adopt',
  '#dog',
];

const getDogHashTags = (breeds) => {
  // return breeds.
  // let hashtags = [...defaultHashTags];
  const mixedTags = breeds.mixed ? [
    '#mixedbreed',
    '#mutt',
  ] : [];

  const breedTags = (breeds.secondary ? [breeds.primary, breeds.secondary] : [breeds.primary])
    .map((breed) => {
      if (breed.includes('/')) {
        return breed.split('/').map((deSlashBreed) => `#${deSlashBreed.split(' ').join('')}`);
      }
      return [`#${breed.split(' ').join('')}`];
    });

  return [
    ...breedTags,
    ...mixedTags,
    ...defaultHashTags,
  ];
};

const getDoggoText = (doggo) => {
  const complimentStr = doggo.gender === 'Female'
    ? getRandomArray(girlCompliments)
    : getRandomArray(boyCompliments);
  const genderStr = doggo.gender === 'Female' ? getRandomArray(girlLabels) : getRandomArray(boyLabels);
  const breedStr = doggo.breeds.secondary ? `${doggo.breeds.primary} / ${doggo.breeds.secondary}` : doggo.breeds.primary;
  const breedMixStr = doggo.breeds.mixed ? `${breedStr} mix` : doggo.breeds.primary;
  return `${doggo.name} is ${complimentStr} ${genderStr}, who can be found near ${doggo.contact.address.city}, ${doggo.contact.address.state}! ${doggo.name} is a ${breedMixStr}, ${getRandomArray(lookingFor)} ${getDogHashTags(doggo.breeds).join(' ')}`;
};

exports.run = async (req, res) => {
  let parsedBody;

  // https://stackoverflow.com/questions/53216177/http-triggering-cloud-function-with-cloud-scheduler
  // tl;dr - If cloud scheduler executes via post request, the content type is not set
  // to application/json, so we need to manually parse the request body
  if (req.header('content-type') === 'application/json') {
    console.log('request header content-type is application/json and auto parsing the req body as json');
    parsedBody = req.body;
  } else {
    console.log('request header content-type is NOT application/json and MANUALLY parsing the req body as json');
    parsedBody = JSON.parse(req.body);
  }

  // Getting the doggo
  const secretManagerClient = new SecretManagerServiceClient();
  const petfinderApiKey = await getFromSecretManager(secretManagerClient, petfinderApiKeyLoc);
  const petfinderSecret = await getFromSecretManager(secretManagerClient, petfinderSecretLoc);
  const petfinderClient = new Client({ apiKey: petfinderApiKey, secret: petfinderSecret });

  const dogs = await petfinderClient.animal.search({ type: 'dog' });
  const doggo = getRandomArray(getValidDoggos(dogs.data.animals));
  console.log('doggo', doggo);
  const doggoResponse = {
    doggo,
    text: getDoggoText(doggo),
    photo: doggo.primary_photo_cropped.medium,
    url: doggo.url,
  };
  console.log(doggoResponse); // logging doggoResponse to debug when necessary

  // base64 encode media, add to tweet
  const base64Media = await imageToBase64(doggo.primary_photo_cropped.medium);
  console.log('got the media');
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

  const tweetText = `${doggoResponse.text} ${doggoResponse.url}`;
  console.log('thinking about making a tweet');
  if (!doggoResponse.text) {
    console.log('no tweet was generated because the doggo text is wrong');
    res.send({
      doggo,
      doggoText: doggoResponse.text,
      photo: doggo.primary_photo_cropped.medium,
      url: doggo.url,
    });
  } else if (parsedBody.noExecuteTweet) {
    res.send({
      tweetText,
    });
  } else {
    console.log('making a tweet');
    const media = await twitClient.post('media/upload', { media_data: base64Media });
    const mediaIdStr = media.data.media_id_string;
    console.log('media', media);
    console.log('got a media id', mediaIdStr);
    const tweetResponse = await twitClient.post('statuses/update', { status: tweetText, media_ids: [mediaIdStr] });
    console.log('made a tweet');
    res.send({
      tweetText,
      tweetResponse,
    });
  }
};
