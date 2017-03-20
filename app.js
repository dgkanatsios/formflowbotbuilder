const builder = require('botbuilder');
const formflow = require('./core');

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

const myDialogName = 'getFields';

formflow.initializeFormFlow('./sample.json', bot, myDialogName, function (err, responses) {
    if (err) {
        console.log(err);
        return;
    }
    else {
        bot.dialog('/', [function (session) {
            session.beginDialog(myDialogName);
        },
        function (session, results) {
            //responses from the user are in results variable as well as in the responses callback argument
            session.send('lele' + JSON.stringify(results));
        }]);

    }

});

