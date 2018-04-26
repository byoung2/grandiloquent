# grandiloquent
[![License](https://img.shields.io/github/license/byoung2/grandiloquent.svg?maxAge=2592000?style=plastic)](https://github.com/byoung2/grandiloquent/blob/master/LICENSE)

> gran·dil·o·quent
> :  (adj.) Marked by fancy, extravagant, or pretentious speech, especially when trying to impress others.
> :  (n.) A grammar parsing and manipulation library

# Table of Contents
1. [Install](#install)
2. [Introduction](#introduction)
3. [Pronouns](#pronouns)
4. [Verbs](#verbs)
5. [Part of Speech Tagging](#part-of-speech-tagging)
6. [Sentence Meta](#sentence-meta)
7. [Transform Sentences](#transform-sentences)
8. [Paragraphs](#paragraphs)
9. [License](#license)

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

console.log(verb.getTense('had been going')); //past perfect progressive

//Grandiloquent is fairly flexible with what you can pass in
let verb = grandiloquent
  .verb('to boldly go')
  .toPastPerfectProgressive();

console.log(verb.toString()); //had been going

//As of 1.2.4, you can keep the adverb after transformation
let verb = grandiloquent
  .verb('to boldly go')
  .keepAdverb()
  .toPastPerfectProgressive();

console.log(verb.toString()); //had been boldly going

//If you hate split infinitives, don't worry, order is preserved
let verb = grandiloquent
  .verb('to go boldly')
  .keepAdverb()
  .toPastPerfectProgressive();

console.log(verb.toString()); //had been going boldly

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

### Part of Speech Tagging
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

### Sentence Meta
```js
let sentence = grandiloquent
  .sentence('Are you the legal guardian of John Connor?');

console.log(sentence.isQuestion()); //true

let sentence = grandiloquent
  .sentence('I was sleeping when you came home.');

console.log(sentence.hasSubordinateClause()); //true

let verb = grandiloquent
  .sentence('While you walked to the car, I called Uber to pick me up.')
  .getMainVerb();

console.log(verb.word); //called

let verb = grandiloquent
  .sentence('Fortunately most doctors agree that diet and exercise are good for your health.')
  .getSubjectPhrase()
  .toString();

console.log(verb.word); //most doctors

let verb = grandiloquent
  .sentence('I cannot understand why you called Uber to pick me up.')
  .getSubjectVerbPhrase()
  .toString();

console.log(verb.word); //I can not understand
```

### Transform Sentences
```js
let sentence = grandiloquent
  .sentence('I walked.')
  .append('to the store')
  .toString();

console.log(sentence); //I walked to the store.

let sentence = grandiloquent
  .sentence('I walked to the store.')
  .prepend('Yesterday')
  .toString();

console.log(sentence); //Yesterday I walked to the store.

let sentence = grandiloquent
  .sentence('I walked to the store.')
  .insert('slowly', 2)
  .toString();

console.log(sentence); //I walked slowly to the store.

let sentence = grandiloquent
  .sentence('I walked to the store.')
  .insert('slowly', {after: '$mainVerb'})
  .toString();

console.log(sentence); //I walked slowly to the store.

let sentence = grandiloquent
  .sentence('I walked to the store.')
  .prepend('Yesterday')
  .toString();

console.log(sentence); //Yesterday I walked to the store.

let sentence = grandiloquent
  .sentence('I walked to the store')
  .insert('slowly', {after: '$mainVerb'})
  .toString();

console.log(sentence); //I walked slowly to the store

let sentence = grandiloquent
  .sentence('After eating breakfast, Joe walked home.')
  .insert('Bill', {replace: '$subject'})
  .toString();

console.log(sentence); //After eating breakfast, Bill walked home.

let sentence = grandiloquent
  .sentence('After eating breakfast, Joe walked home.')
  .replace('$subject', 'Bill')
  .toString();

console.log(sentence); //After eating breakfast, Bill walked home.

let sentence = grandiloquent
  .sentence('After eating breakfast, the student walked home.')
  .transform('$subject', 'toPlural')
  .toString();

console.log(sentence); //After eating breakfast, the students walked home.

let sentence = grandiloquent
  .sentence('The student walks home.')
  .transform('$mainVerb', 'toPast')
  .toString();

console.log(sentence); //The student walked home.

let sentence = grandiloquent
  .sentence('After lunch the student will walk home.')
  .transform('$mainVerbPhrase', 'toPast')
  .toString();

console.log(sentence); //After lunch the student walked home.

let sentence = grandiloquent
  .sentence('After lunch the student will walk home while his teacher grades papers.')
  .transform('$allVerbPhrases', 'toPast')
  .toString();

console.log(sentence); //After lunch the student walked home while his teacher graded papers.
```

### Paragraphs
Paragraph methods split strings into component sentences, with some methods to
operate on those sentences in context.
```js
let paragraph = grandiloquent
  .paragraph('I came. I saw. I conquered.');

console.log(paragraph.sentences[1].input); //I saw
```

A coreference is a link between a pronoun (e.g. she, he, her, him) and its noun.
```js
let paragraph = grandiloquent
  .paragraph('Jane saw Bob play the guitar. She was very impressed.')
  .resolveCoreferences();

console.log(paragraph.sentences[1].tagged[0].coreference.word); //Jane

let paragraph = grandiloquent
  .paragraph('Jane saw Bob play the guitar. She was very impressed.')
  .resolveCoreferences()
  .replaceCoreferences();

console.log(paragraph.sentences[1].current); //Jane was very impressed
```

## License

Grandiloquent.js is freely distributable under the terms of the [MIT license](https://github.com/byoung2/grandiloquent/blob/master/LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
