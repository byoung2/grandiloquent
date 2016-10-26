const contractions = [
  [/([a-z])'(re|ll|ve|d|m|s)/ig, "$1 '$2"],
  [/([a-z])(n't)/ig, "$1 not"],
  [/lemme/ig, "let me"],
  [/gonna/ig, "going to"],
  [/wanna/ig, "want to"],
  [/gotta/ig, "got to"],
  [/gimme/ig, "give me"],
  [/cannot/ig, "can not"]
];

module.exports = contractions;
