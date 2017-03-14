const natural = require('natural'),
tokenizer = new natural.WordTokenizer(),
PorterStemmerRu = require('./node_modules/natural/lib/natural/stemmers/porter_stemmer_ru'),
nodehun = require('nodehun'),
fs = require('fs'),
affbuf = fs.readFileSync('/home/datafile4/host/spellcheckers/dictionaries/Russian.aff'),
dictbuf = fs.readFileSync('/home/datafile4/host/spellcheckers/dictionaries/Russian.dic'),
trainFile = fs.readFileSync('/home/datafile4/host/data/data.csv');
stopwords_ru = require('stopwords-ru');
var dict = new nodehun(affbuf, dictbuf);
var classifier = new natural.BayesClassifier();
trainFile.toString().split(/\n/).forEach(function (line) {
	var string = tokenizer.tokenize(line);
	//var sentence = tokenizer.tokenize(line[0]);
	//var string = line.split(",");
	var sentence = string.slice(0, -1)
	var sentence_class = string[string.length - 1];
	//console.log("S: " + sentence + " C: " + sentence_class);
	sentence.forEach(function (word, index, array) {
		dict.spellSuggest(word, function (err, correct, suggestion, origWord) {
			if (!err) {
				if (correct) {
					array[index] = origWord;
				} else if (suggestion != null) {
					array[index] = suggestion;
				}
				if(contains(array[index],stopwords_ru)){
					array.splice(index,1);
					console.log("PING!");
				}
			}
		});
	});
	console.log("S: " + sentence + " C: " + sentence_class);
	//classifier.addDocument(sentence, sentence_class);
});
//classifier.train();
//classifier.save('classifier.json');

function contains(word, stopwords_ru) {
	var flag = false;
	for (var i = 0; i < stopwords_ru.length; i++) {
		if (stopwords_ru[i] == word) {
			flag = true;
			break;
		}
	}
	return flag;
}
