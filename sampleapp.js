const builder = require('botbuilder');
const formflowbotbuilder = require('.');

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

const myDialogName = 'getFields';

formflowbotbuilder.executeFormFlow('./sampledata.json', bot, myDialogName, function (err, responses) {
  if (err) {
    console.log(err);
  } else {
    bot.dialog('/', [function (session) {
      session.beginDialog(myDialogName);
    },
      function (session, results) {
            // responses from the user are in results variable as well as in the responses callback argument
        session.send('results: ' + JSON.stringify(responses));
      }]);
  }
});
