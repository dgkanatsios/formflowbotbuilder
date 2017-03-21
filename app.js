const builder = require('botbuilder');
const formflowbotbuilder = require('./core');

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

const myDialogName = 'getFields';

formflowbotbuilder.executeFormFlow('./sample.json', bot, myDialogName).then(function (responses) {
    bot.dialog('/', [function (session) {
        session.beginDialog(myDialogName);
    },
    function (session, results) {
        //responses from the user are in results variable as well as in the responses callback argument
        session.send('results: ' + JSON.stringify(responses));
    }]);
}).catch((error) => console.log(error));

