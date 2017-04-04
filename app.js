const natural = require('natural'),
tokenizer = new natural.WordTokenizer(),
PorterStemmerRu = require('./node_modules/natural/lib/natural/stemmers/porter_stemmer_ru'),
nodehun = require('nodehun'),
fs = require('fs'),
async = require('async'),
affbuf = fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\spellcheckers\\dictionaries\\Russian.aff'),
dictbuf = fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\spellcheckers\\dictionaries\\Russian.dic'),
stopwords_ru = require('stopwords-ru');
var trainSentences = (fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\data\\data.csv')).toString().split(/\n/);
var testSentences = (fs.readFileSync('C:\\Users\\emil.alasgarov\\SharedVmware\\data\\test.csv')).toString().split(/\n/);
var dict = new nodehun(affbuf, dictbuf);
var classifier = new natural.BayesClassifier();
var false_classified_count = 0;
var false_percentage = -1;

function parseStrings(string_array, string_work, final_work) {
	async.each(string_array, function (line, outer_callback) {
		var temp_line = tokenizer.tokenize(line.replace('ё', 'е'));
		var sentence = temp_line.slice(0, -1);
		var sentence_class = temp_line[temp_line.length - 1];
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
				}
				callback();
			});
		}, function (err) {
			if (!err) {
				string_work(temp_sentence.substring(0, temp_sentence.length - 1), sentence_class);
				console.log(temp_sentence.substring(0, temp_sentence.length - 1) + " " + sentence_class + "\n");
			} else {
				console.log("error in addDocument")
			}
			temp_sentence = "";
			outer_callback();
		});
	}, function (err) {
		if(!err){
			final_work();
		}
		if(false_percentage < 0){
			setTimeout(parseStrings,3000,testSentences, passTestSentence, calcPercentage)
		}
	});

}

function calcPercentage() {
	if (testSentences.length != 0) {
		false_percentage = 100 - ((false_classified_count * 100) / testSentences.length);
	}
	console.log(false_percentage);
}

function trainModel() {
	classifier.train();
	classifier.save('classifier.json');
	console.log('Train');
}

function passAddDocument(sentence_text, sentence_class) {
	classifier.addDocument(sentence_text.substring(0, sentence_text.length - 1), sentence_class);
}

function passTestSentence(sentence_text, sentence_class) {
	var result_class = classifier.classify(sentence_text);
	console.log(sentence_text + " orig: " + sentence_class + " classified: " + result_class);
	if (result_class != sentence_class) {
		false_classified_count++;
	}
}

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

parseStrings(trainSentences, passAddDocument, trainModel);

//parseStrings(testSentences, passTestSentence, calcPercentage);