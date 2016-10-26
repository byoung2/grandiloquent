# grandiloquent
[![Node.js Version][node-version-image]][node-version-url]
[![License](https://img.shields.io/github/license/byoung2/grandiloquent.svg?maxAge=2592000?style=plastic)](https://github.com/byoung2/grandiloquent/blob/master/LICENSE)

A grammar parsing and manipulation library

## Install

```sh
$ npm install --save grandiloquent
```

## Introduction

Grandiloquent is a grammar manipulation library. You can use it to change the person or number of pronouns, and to transform verbs between tenses. This is particularly useful for creating grammar correction applications, preprocessing text for NLP or sentiment analysis applications, creating chatbots, etc.

Here are a few examples:

```js
const grandiloquent = require('grandiloquent');
```

### Pronouns
```js
let pronoun = grandiloquent.pronoun('they');

pronoun.setGender('female'); //pronoun default gender for singular

pronoun.toSingular();
console.log(pronoun.toString()); //she

//Methods are chainable
let chain = grandiloquent
  .pronoun('it')
  .setGender('female') //she
  .toPlural() //they
  .toFirstPerson() //we

console.log(pronoun.toString()); //we
```

### Verbs
```js
let verb = grandiloquent.verb('walks');

verb.toBase(); //verb is mutated
console.log(verb.toString()); //walk

verb.toPast();
console.log(verb.toString()); //walked

verb.toFuture();
console.log(verb.toString()); //will walk

//Grandiloquent is fairly flexible with what you can pass in
let verb = grandiloquent
  .verb('to boldly go')
  .toPastPerfectProgressive();

console.log(verb.toString()); //had been going

//You can pass an instance of grandiloquent.pronoun.model to verb methods
let pronoun = grandiloquent
  .pronoun('we')
  .setGender('or')
  .toSingular() //I
  .toThirdPerson() //he or she

let verb = grandiloquent
  .verb('circumnavigate')
  .toFuturePerfectProgressive(pronoun);
console.log(verb.toString()); //he or she will have been circumnavigating
```

### Part of Speech Tagging (experimental)
Grandiloquent includes an experimental pattern-based part of speech tagger. Using part of speech tokens described in the [Brown Corpus](https://en.wikipedia.org/wiki/Brown_Corpus) and a rules-based approach inspired by the [Brill Tagger](https://en.wikipedia.org/wiki/Brill_tagger), this tagger tests an approach that attempts to avoid a large lexicon file in favor of more pattern-based matching. Starting with a list of the top 2000 English words manually tagged, the tagger uses regular expressions to guess parts of speech for other words. Since some words can have more than one possible part of speech, patterns for groups of words are used to guess the most likely combination of tags.
```js
var sentence = grandiloquent
  .sentence('My name is Jonas.');
console.log(sentence.tagged);
```
Outputs
```json
[
    {
        "word": "My",
        "index": 0,
        "tags": {
            "all": [
                "PP$"
            ],
            "current": "PP$"
        },
        "meta": {
            "pos": "possessive personal pronoun (my, our)",
            "reason": "pattern",
            "pattern": {
                "0": "PP$",
                "1": "NN",
                "2": "VBZ"
            }
        }
    },
    {
        "word": "name",
        "index": 1,
        "tags": {
            "all": [
                "NN",
                "VB",
                "JJ"
            ],
            "current": "NN"
        },
        "meta": {
            "reason": "pattern",
            "pos": "singular or mass noun",
            "pattern": {
                "0": "PP$",
                "1": "NN",
                "2": "VBZ"
            }
        }
    },
    {
        "word": "is",
        "index": 2,
        "tags": {
            "all": [
                "VBZ"
            ],
            "current": "VBZ"
        },
        "meta": {
            "pos": "verb, 3rd. singular present",
            "reason": "pattern",
            "pattern": {
                "0": "PP$",
                "1": "NN",
                "2": "VBZ"
            }
        }
    },
    {
        "word": "Jonas",
        "index": 3,
        "tags": {
            "all": [
                "NP"
            ],
            "current": "NP"
        },
        "meta": {
            "pos": "proper noun or part of name phrase",
            "reason": null
        }
    },
    {
        "word": ".",
        "index": 4,
        "tags": {
            "all": [],
            "current": null
        },
        "meta": {
            "reason": null
        }
    }
]
```

## License

Grandiloquent.js is freely distributable under the terms of the [MIT license](https://github.com/byoung2/grandiloquent/blob/master/LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[node-version-image]: https://img.shields.io/badge/node-%3E%3D4.3.2-blue.svg
[node-version-url]: https://nodejs.org/en/download/
