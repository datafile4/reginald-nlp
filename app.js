const natural = require('natural'),
tokenizer = new natural.WordTokenizer(),
PorterStemmerRu = require('./node_modules/natural/lib/natural/stemmers/porter_stemmer_ru'),
nodehun = require('nodehun'),
fs = require('fs'),
async = require('async'),
affbuf = fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\spellcheckers\\dictionaries\\Russian.aff'),
dictbuf = fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\spellcheckers\\dictionaries\\Russian.dic'),
trainFile = fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\data\\data.csv');
stopwords_ru = require('stopwords-ru');
var dict = new nodehun(affbuf, dictbuf);
var classifier = new natural.BayesClassifier();
async.each(trainFile.toString().split(/\n/), function (line, outer_callback) {
	var temp_line = tokenizer.tokenize(line.replace('ё', 'е'));
	var sentence = temp_line.slice(0, -1);
	var sentence_class = temp_line[temp_line.length - 1];
	//var spl_checked_sentence = [];
	var temp_sentence = "";
	async.eachOf(sentence, function (word, index, callback) {
		dict.spellSuggest(word, function (err, correct, suggestion, origWord) {
			if (!err) {
				var temp_word;
				if (!correct && suggestion != null) {
					temp_word = suggestion;
					console.log("orig: " + word + ", suggested: " + suggestion);
				} else {
					temp_word = word;
				}
				if (!contains(temp_word, stopwords_ru)) {
					/*sentence.splice(index, 1);
					console.log("deleted: " + word);*/
					//spl_checked_sentence.push(temp_word);
					temp_sentence = temp_sentence + temp_word + " ";
				} else {
					console.log(" deleted: " + temp_word);
				}
				//console.log("orig: " + word + ", suggested: " + sentence[index]);
			}
			callback();
		});
	}, function (err) {
		//console.log("S: " + spl_checked_sentence + " C: " + sentence_class + "\n");
		if (!err) {
			classifier.addDocument(temp_sentence.substring(0, temp_sentence.length - 1), sentence_class);
			console.log(temp_sentence.substring(0, temp_sentence.length - 1) + " " + sentence_class + "\n");
			//spl_checked_sentence = [];
		} else {
			console.log("error in addDocument")
		}
		temp_sentence = "";
		outer_callback();
	});	
}, function (err) {	
		console.log("The End");	
		classifier.train();
		classifier.save('classifier.json');
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
