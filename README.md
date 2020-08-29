# README #

**This is not an officially supported Google product.**

This README explains how to install the app and get it running in the cloud.
This document is split up into three sections:
1. Creating your test environment
1. Creating your production environment
1. Configuring advanced functionality
1. Adding gallery images, sound effects, and languages

## 1. Creating your test environment ##

You will first create a project for your test environment. This will let you
run your code on your local machine, and deploy to a test environment in the
cloud.


### A. Create a project on Google Cloud Platform ###

1. Go to https://console.cloud.google.com.
1. Click the *Select a project* item at the top of the screen.
1. Click *New project* in the window that appears.
1. Enter a project name. Users will access your app at *https://X.web.app*, where
X is the project name, so choose your project name wisely.
    * If this is the first time you are performing these steps, you
    are creating your test environment. I recommend you enter X followed by *-test* as
    your project name; for example: *mywheel-test*.
    * If this is the second time you are performing these steps, you
    are creating your production environment. I recommend you enter X as
    your project name; for example: *mywheel*.

### B. Create a Firebase project ###

1. Go to https://console.firebase.google.com.
1. Click *Create a project*.
1. When you are asked to enter your project name, pick the Google Cloud Platform
project you created in the previous section.
1. When asked, pick whatever billing plan works best for you.
1. When asked, don't enable Google Analytics for your project.
1. Click the *Create project* button.


### C. Create a new web app in Firebase ###

1. Select your newly created Firebase project, and then click *Project overview*
in the left-hand navigation bar.
1. Click the *web* icon under *Get started by adding Firebase to your app*.
1. Enter a nickname for your app and check the *Firebase Hosting* checkbox.
1. Follow the instructions to install the Firebase CLI.
1. Don't run *firebase login*, *firebase init*, or *firebase deploy*. Instead,
just click through to finish the setup.


### D. Set up Firebase Authentication for Google ###

1. Select your newly created Firebase project, then click *Develop* followed by
*Authentication* in the left-hand navigation bar.
1. Click *Set up sign-in method*.
1. Click *Google* in the list.
1. Click the slider in the upper right-hand corner to enable Google sign-in.
1. Click Save.


### E. Create a Firestore database ###

1. Select your newly created Firebase project, and then click *Cloud Firestore*
in the left-hand navigation bar.
1. Click *Create database*.
1. Pick the option to start in *Production* mode.
1. Pick a database location that is close to the majority of your users.


## Run the app locally ##

### Modify .firebaserc ###

1. Open the file *.firebaserc*, or create it if it doesn't exist.
1. Modify it to look like this (where Z is the id of your test project, for example *mywheel-test* or *serene-screwdriver-2341*):
```
    {
      "projects": {
        "test": "Z"
      }
    }
```

### Install Node modules ###

1. At the command prompt, run
    ```
        npm install -g firebase-tools
    ```
1. At the command prompt, run
    ```
        firebase login
    ```
1. At the command prompt in the top-level directory, run
    ```
        npm install
    ```
1. At the command prompt in the *functions* directory, run
    ```
        npm install
    ```
1. Go back up to the top-level directory.

### Create build/dev.env ###

1. In the *build* directory, create the file *dev.env* with this contents:
    ```
    FUNCTION_PREFIX=
    FIREBASE_API_KEY=
    FIREBASE_AUTH_DOMAIN=
    FIREBASE_DATABASE_URL=
    FIREBASE_PROJECT_ID=
    OAUTH_CLIENT_ID=
    GCP_APP_ID=
    ````
1. Add these values after the equal signs:
    * FUNCTION_PREFIX: Run the script *./build_and_serve_local.sh*. You will
      see a message saying
      ```
      http function initialized (http://localhost:5001/mywheel-test/us-central1/createSharedWheel2
      ```
      Copy the string starting at *http* and ending before *createSharedWheel2*.
      For example:
      ```
      http://localhost:5001/mywheel-test/us-central1
      ```
      Close down the process when done by clicking Ctrl C.
    * FIREBASE_API_KEY: Go to *console.firebase.google.com* and click your Firebase
      project. Click the cogwheel next to *Project overview*. Copy the value of
      the *Web API Key*.
    * FIREBASE_AUTH_DOMAIN: Enter *Z.firebaseapp.com*
      where Z is the id of your test project. For example *mywheel-test*.
    * FIREBASE_DATABASE_URL: Enter *https://Z.firebaseio.com*
      where Z is the id of your test project. For example *https://mywheel-test.firebaseio.com*.
    * FIREBASE_PROJECT_ID: Enter the id of your test project. For example:
      *mywheel-test*.
    * OAUTH_CLIENT_ID: Go to *console.cloud.google.com* and select your project.
      Click the navigation menu in the upper right-hand corner of the page.
      Select *APIs & Services* and then *Credentials*. Under *OAuth 2.0 Client IDs*,
      copy the *Client ID* for the auto-generated web client. It should end with
      *apps.googleusercontent.com*.
    * GCP_APP_ID: Go to *console.cloud.google.com* and select your project.
      Click the navigation menu in the upper right-hand corner of the page.
      Select Home. Under *Project info*, copy the *Project number*. For example:
      *57344078235*.


### Host the app on your local machine ###

1. In the top-level directory, run *./build_and_serve_local.sh*.
1. One of the messages will say something like
   ````
   ✔  hosting: Local server: http://localhost:5000
   ````
1. Open that URL in your browser. Your application is now running on your local
machine. If you click Save, Open, or Share, your machine will access the
Firestore database in your test project in the cloud.


### Deploy to your test environment in the cloud ###

1. Copy the file *build/dev.env* to *build/test.env*.
1. Run *./build_test.sh*.
1. Run *./deploy_test.sh*. If one of the functions fails to deploy, run the
command again.
1. You will see a message saying
   ```
   Function URL (getSharedWheel): https://us-central1-mywheel-test.cloudfunctions.net/getSharedWheel
   ```
   Copy the string starting at *https* and ending before */createSharedWheel*.
   For example:
   ```
   https://us-central1-mywheel-test.cloudfunctions.net
   ```
1. Open the file *build/test.env*.
1. Paste the URL you copied above into the first line. For example:
   ````
   FUNCTION_PREFIX=https://us-central1-mywheel-test.cloudfunctions.net
   ````
1. Run *./build_test.sh* and *./deploy_test.sh* again. Now that you have updated
the file *build/test.env*, running these two scripts will be enough to deploy
your code to your test environment in the cloud.
1. You will see a message like
    ````
    Hosting URL: https://mywheel-test.web.app
    ````
    Go to that URL to use the application in your test environment in the cloud.


## 2. Creating your production environment ##

### Create and configure projects ###

Do steps A through E under *Creating your test environment* above. When you
create your Google Cloud Platform project, enter a project name without
*-test*. For example: *mywheel*.

### Modify .firebaserc ###

1. Open the file *.firebaserc*.
1. Modify it to look like below. Replace the brackets and the text in them with
your project names.
```
    {
      "projects": {
        "prod": "[id of your production project]",
        "test": "[id of your test project]"
      }
    }
```

### Modify build/prod.env ###

1. Copy the file *build/test.env* to *build/prod.env*.
1. Add these values after the equal signs:
    * FUNCTION_PREFIX: Run the scripts *./build_prod.sh* and *./deploy_prod.sh*.
      If one of the functions fails to deploy, run *./deploy_prod.sh* again.
      You will see a message saying
      ```
      Function URL (getSharedWheel): https://us-central1-mywheel.cloudfunctions.net/getSharedWheel
      ```
      Copy the string starting at *https* and ending before */createSharedWheel*.
      For example:
      ```
      https://us-central1-mywheel.cloudfunctions.net
      ```
      Enter this value after *FUNCTION_PREFIX=* in the file.
    * FIREBASE_API_KEY: Go to *console.firebase.google.com* and click your Firebase
      **production** project. Click the cogwheel next to *Project overview*. Copy the value of
      the *Web API Key*.
    * FIREBASE_AUTH_DOMAIN: Enter *Z.firebaseapp.com*
      where Z is the id of your **production** project. For example *mywheel*.
    * FIREBASE_DATABASE_URL: Enter *https://Z.firebaseio.com*
      where Z is the id of your **production** project. For example *https://mywheel.firebaseio.com*.
    * FIREBASE_PROJECT_ID: Enter the id of your **production** project. For example:
      *mywheel*.
    * OAUTH_CLIENT_ID: Go to *console.cloud.google.com* and select your **production** project.
      Click the navigation menu in the upper left-hand corner of the page.
      Select *APIs & Services* and then *Credentials*. Under *OAuth 2.0 Client IDs*,
      copy the *Client ID* for the auto-generated web client. It should end with
      *apps.googleusercontent.com*.
    * GCP_APP_ID: Go to *console.cloud.google.com* and select your **production** project.
      Click the navigation menu in the upper left-hand corner of the page.
      Select Home. Under *Project info*, copy the *Project number*. For example:
      *64967613275*.

### Deploy to your production environment in the cloud ###

1. Run *./build_prod.sh*.
1. Run *./deploy_prod.sh*. If one of the functions fails to deploy, run the
command again.
1. You will see a message like
    ````
    Hosting URL: https://mywheel.web.app
    ````
    Go to that URL to use the application in your test environment in the cloud.
1. If you modify code and build and deploy again, make sure you refresh the web
page by holding down shift when clicking the Reload icon in your browser. The
app is a Progressive Web App, with client-side caching meant to maximize
performance.


## 3. Configuring advanced functionality ##

### Enable traffic reporting with Google Analytics ###

1. Create a new Google Analytics account and property at http://analytics.google.com/.
1. In the files *index.html* and *view.html*, replace the text ```UA-XXXXXXXXX```
with your Analytics tracking id.

### Enable Facebook login ###

1. Go to https://developers.facebook.com and create a new app.
1. Go to *console.firebase.google.com* and click *Authentication*.
1. Turn on Facebook authentication and enter your app's details from
Facebook's site.

### Enable Twitter login ###

1. Go to https://apps.twitter.com and create a new app.
1. Go to *console.firebase.google.com* and click *Authentication*.
1. Turn on Twitter authentication and enter your app's details from
https://apps.twitter.com.

### Enable the "Get Twitter users" menu option ###

1. Go to https://apps.twitter.com and find your app. Keep this web page open as
you will need information from it for the steps below.
1. Go to *cloud.console.google.com*, click the navigation menu in the upper
left-hand corner of the screen, and select *Firestore*.
1. Click *Start collection*.
1. Set *Collection ID* to *settings*.
1. Under *Add its first document*, enter the *Document ID* TWITTER_APP_KEY.
1. In the *Field name* text-box, enter *value*.
1. In the *Field value* text-box, enter your app key from Twitter.
1. Click *Save and add another*.
1. Enter the *Document ID* TWITTER_APP_SECRET.
1. In the *Field name* text-box, enter *value*.
1. In the *Field value* text-box, enter your app secret from Twitter.
1. Click *Save and add another*.
1. Enter the *Document ID* TWITTER_APP_SECRET.
1. In the *Field name* text-box, enter *value*.
1. In the *Field value* text-box, enter your app secret from Twitter.
1. Click *Save*.

### Enable Google Sheets import ###

1. Go to *cloud.console.google.com*, click the navigation menu in the upper
left-hand corner of the screen, and select *API & Services* and then
*OAuth consent screen*.
1. Click *Edit app*.
1. Fill out the form and submit it. Note that you will need to publish a
privacy policy online and enter its web address in this form.
1. Wait for Google to approve your app.

### Enable Progressive Web App (PWA) ###

1. Open the file *manifest.json*.
1. In the *start_url* value, replace XXXX with the web address of your
production app.

### Enable cron jobs to clean up old data ###

It's good privacy practice to delete old, unused data. Here is how to enable that.

1. Go to *cloud.console.google.com*, click the navigation menu in the upper
left-hand corner of the screen, and select *Cloud Scheduler*.
1. Click *Create job*, enter the following in the input fields, and click the *Create* button.
This job deletes the account of any user who hasn't logged in for six months.
   | Field | What to enter |
   |-------|---------------|
   | Name  | ```delete-inactive-users``` |
   | Description  | ```Delete inactive users``` |
   | Frequency  | ```30 * * * *``` |
   | Timezone  | *[Pick your timezeone]* |
   | Target  | ```HTTP``` |
   | URL  | *[Copy the value of FUNCTION_PREFIX from build/prod.env]*```/deleteInactiveAccounts``` |
   | HTTP method  | ```GET``` |
1. Create a second scheduled job. This job deletes any shared wheels that
have never been accessed, 14 days after they were created.
   | Field | What to enter |
   |-------|---------------|
   | Name  | ```delete-unused-shared-wheels``` |
   | Description  | ```Delete unused shared wheels``` |
   | Frequency  | ```40 * * * *``` |
   | Timezone  | *[Pick your timezeone]* |
   | Target  | ```HTTP``` |
   | URL  | *[Copy the value of FUNCTION_PREFIX from build/prod.env]*```/deleteUnusedSharedWheels``` |
   | HTTP method  | ```GET``` |
1. Create a third scheduled job. This job deletes any shared wheels that
haven't been accessed for six months.
   | Field | What to enter |
   |-------|---------------|
   | Name  | ```delete-used-shared-wheels``` |
   | Description  | ```Delete used shared wheels``` |
   | Frequency  | ```35 * * * *``` |
   | Timezone  | *[Pick your timezeone]* |
   | Target  | ```HTTP``` |
   | URL  | *[Copy the value of FUNCTION_PREFIX from build/prod.env]*```/deleteUsedSharedWheels``` |
   | HTTP method  | ```GET``` |
1. In the list of scheduled jobs, click the *Run now* button for each one, to
make sure it works. Wait a minute and click the *Refresh* button so see the
success or failure of the jobs.



## 4. Adding gallery images, sound effects, and languages ##

### Adding gallery images ###

These are the images that show up if you click *Options*, then the *Image* tab,
and then select *From Gallery*.

1. Prepare your image files. Ideally they are square or nearly square and about
200-300 pixels wide.
1. Put the image files in the *static/images* directory.
1. Open the file *ImageCache.js* and add the new images to the import statements
at the top of the file.
1. Open the file *galleryImageList.js* and add the new images to the exports
at the top of the file. Enter the file's name and what name it should show up
as in the Gallery dropdown box.

### Adding sound effects ###

These are the sound effects that the user can choose from if they click
*Options*, then the *During spin* or *After spin* tab.

1. Prepare your sound files. Ideally they should be mp3 files. Music files that
aer meant to play when the wheel is spinning should be 30 seconds long.
1. Put the sound files in the root directory.
1. Open the file *audio.js* and add the new sound files to the import statements
at the top of the file.
1. In the same file, add the new sound files to
    * *duringSpinSounds* if they should be available to play while the wheel is
      spinning.
    * *afterSpinSounds* if they should be available to play after the wheel
      has stopped.

### Adding languages ###

The languages are visible in the dropdown box near the upper right-hand corner
of the web page.

1. Make a copy of the file *locales/en-US.json*. Give the new file a name
that contains the code and locale of the language you wish to add. For example,
if you want to add German as spoken in Germany, you'd add the file *de-DE.json*.
1. Each line of this file contains the id of a string, a colon, and the value of
that string in the chosen language. Translate the values (after the colons) to
your new language.
1. Special case: the string with id *Click the Language menu*, should say the
language's name in that language instead of *English*. This string appears to
the user if they are viewing the website in a different language than what their
system users. For example, if a person with a German system views the website
in English, they should see the message
    ```
    Klicken Sie auf das "Language"-Menü oben rechts, um zu Deutsch zu wechseln.
    ```
1. Add a row at the beginning of *Locales.js* for your new language. Follow the
format of the existing rows.
