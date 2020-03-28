# secret-voldemort

[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat)](https://github.com/reediculous456/secret-voldemort/issues)
[![Styled with Prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Secret Voldemort is a dramatic game of intrigue and betrayal set in the Wizarding World of Harry Potter. Players are secretly divided into two teams - Order of the Pheonix members and Death Eaters.
Known only to each other, the Death Eaters coordinate to sow distrust and install their cold-blooded leader. The Order of the Pheonix members must find and stop the Secret Voldemort before it’s too late.

Effectively this is a take on the classic social deduction/hidden role board game genre such as Werewolf and Mafia, but closer to the Resistance. Games are 5-10 players, the minority (Death Eaters) know who everyone is and the majority (Order of the Pheonix members) don't know anything. Over the course of the game the Order of the Pheonix members need to try to identify the Death Eaters to win and the Death Eaters need to remain hidden, with an extra "super-death-eater" role with an additional win condition for both sides.

This codebase is a "lobby style" implementation of this game - anyone can make a game which is displayed on a list on the "home" page. The game starts when enough players are seated. In addition, anyone can watch a game in progress, etc.

![Screenshot](https://cdn.discordapp.com/attachments/532418308977328139/538550232015962112/unknown.png)

Considering contributing to this project? Please read our brief guidelines found at
[CONTRIBUTING](https://github.com/reediculous456/secret-voldemort/blob/master/.github/CONTRIBUTING.md). Contributors get a cool special playername color!

Front end: React, Redux, Sass, Semantic UI, jQuery, SocketIO.

Back end: Node, Express, Pug, Passport, Mongodb with Mongoose, SocketIO.

## Installation

Install [node.js version: LTS](https://nodejs.org/en/), have it in your path.

Install [git](https://git-scm.com/downloads), have it in your path.

Install [mongodb](https://www.mongodb.com/download-center?ct=atlasheader#community), have it in your path.

Install [npmjs](https://www.npmjs.com/get-npm) for your OS.

then

```bash
git clone git@github.com:reediculous456/secret-voldemort.git
cd secret-voldemort
npm install
```

## Running in dev mode

**Start development:**

```bash
npm run dev
```

Navigate to: http://localhost:8080

You'll most likely need a browser extension such as Chrome's [SessionBox](https://chrome.google.com/webstore/detail/sessionbox-free-multi-log/megbklhjamjbcafknkgmokldgolkdfig?hl=en) to have multiple sessions on the same browser. No, incognito will not work. When developing in Chrome, you'll want to check "disable cache" on the network tab - my webpack setup isn't great and it doesn't cache bust itself. Also it will be very helpful to make all of the "quickdefault" accounts with the default password, `snipsnap`, so that you can log in to an account in one click. There is an npm script you may run once `server` or `dev` npm scripts are already running called `create-accounts` which will attempt to populate all of the helper accounts into the database.

```bash
npm run create-accounts
```

**Assigning a local mod:**

In order to better test all functions of the site in a local development environment it is useful to assign an admin account.
This is done for you through the `secret-voldemort/scripts/assignLocalMod.js` file courtesy of contributor Hexicube.
After running the `create-accounts` script you will have the helper accounts populated into the database.
Running the next line below will then assign `Uther` to the `admin` staffRole to better test all site functions in testing.

```bash
npm run assign-local-mod
```

Upon seeing the end result in the terminal of `Assigned.` you will know it worked. Just refresh your localhost:8080 page at this point and then you will have a local mod to test additional functions of the site with in a development mode environment.

## Running in production mode

Don't. Respect the maintainer and contributors who have given their time for free to make SH.io as good as it is. Running this codebase outside of SH.io may have unintended consequences.

## Statistics

Production has a limited set of data on the /stats page, check network traffic for the XHR for that if interested. If you'd like to do more detailed data analysis, please contact the maintainer for a dump of the (anonymized) profile and replay data.

## License and Attribution

Secret Voldemort is based on [Secret Hitler](https://www.secrethitler.com/), which is is designed by Max Temkin, Mike Boxleiter, Tommy Maranges, and illustrated by Mackenzie Schubert.

The code base is forked from [SecretHitler.io](https://github.com/cozuya/secret-hitler)

This game is licensed as per the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)
license.

## Alterations to the original game

All of the visual elements of the game have been modified to match the branding from the Wizarding World of Harry Potter (assets available upon request). I did not design the assets for this reskin of the game, they were downloaded from [TheCraftyPlayers.com](https://thecraftyplayers.com/2017/02/22/secret-voldemort/).

Most of the terms involved in gameplay have been adjusted to match the branding from the Wizarding World of Harry Potter.

Expelliarmus is slightly adjusted so that headmasters need to select a proclamation prior to saying yes or no to vetoing that proclamation.

Adapted the rules explanation to account for online vs physical play.

There is an option when players make a game to "rebalance" the 6, 7 and 9 player games - 6p starts with a Death Eater proclamation already enacted, 7p starts with one less Death Eater proclamation in the deck, 9p starts with two less Death Eater proclamations in the deck. Players (and results from analyzing statistics) have noted that these game modes are not balanced well in the original ruleset.

There is a custom game mode where game creators can make games with different rulesets such as being able to pick proclamation powers, pick number of Death Eaters (always less than Order of the Pheonix members), number of proclamations, etc.
