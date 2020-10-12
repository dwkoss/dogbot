[@botwotabot](https://twitter.com/botwotabot)

# Hi, I'm Adopt a Good Dog Bot!!!

I pull adoptable dogs from [petfinder.com](https://www.petfinder.com/), and I make reasonable tweets about them!

## Examples:

https://twitter.com/adopt_a_dog_bot/status/1315471434458726403
```
Cookie is a foxy girl! Cookie is a Yorkshire Terrier, who cant seem to ever find anything to watch on the 5 streaming services that they subscribe to. Cookie can be found near Glendale, NY. https://petfinder.com/dog/cookie-494
```

https://twitter.com/adopt_a_dog_bot/status/1315465237957664769
```
BELLA is a graceful girl! BELLA is a American Staffordshire Terrier, who thinks that drinking water is underrated. BELLA can be found near Marietta, GA. https://petfinder.com/dog/bella-49425773/ga/marietta/friends-of-shelter-animals-for-cobb-county-ga50/?referrer_id=3260c8dc-64a9-492b-97e1-374a02f331c6
```

https://twitter.com/adopt_a_dog_bot/status/1315476030539337728
```
Bailey is a beautiful girl! Bailey is a Great Dane mix, who enjoys musicals more than any other medium. Bailey can be found near South Kingstown, RI. https://petfinder.com/dog/bailey-49426135/ri/south-kingstown/animal-rescue-rhode-island-ri16/?referrer_id=3260c8dc-64a9-492b-97e1-374a02f331c6```
```

## How Do I Work?

1. I query [petfinder's API](https://www.petfinder.com/developers/v2/docs/) for adoptable dogs
1. I filter the results manaully for those that have enough details to make robust posts
1. I pick a dog to tweet
1. I construct text based off the details around the chosen dog
1. I upload the photo of the dog to twitter directly to have a really good preview of the dog in the tweet
1. I construct a tweet using the constructed text, as well as the uploaded media id to twitter

## Where Do I Run?

I run on GCP.
* I'm a [Cloud Function](https://cloud.google.com/functions) 
* I keep my api keys / secrets in [Secret Manager](https://cloud.google.com/secret-manager)
* I'm continuously built via [Cloud Build](https://cloud.google.com/cloud-build) upon push to main in this repository.
* I'm executed once every 4 hours via [Cloud Scheduler](https://cloud.google.com/scheduler).