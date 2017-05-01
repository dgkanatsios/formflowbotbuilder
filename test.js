/* globals describe, it */

describe('formflowbotbuilder', function () {
  it('property populates a bot framework dialogs', function (done) {
    const builder = require('botbuilder');
    const formflowbotbuilder = require('.');

    const connector = new builder.ConsoleConnector().listen();
    const bot = new builder.UniversalBot(connector);

    const myDialogName = 'getFields';

    formflowbotbuilder.executeFormFlow('./sampledata.json', bot, 'testDialogName', function (err, responses) {
      if (err) {
        return done('error returned ' + err);
      } else {
        let count = 0;
        bot.forEachDialog((dialog) => {
          if (!(Object.getPrototypeOf(dialog) === builder.SimpleDialog.prototype)) { return done('wrong dialog type'); }
          count++;
        });
        if (count !== 4) return done('wrong dialog length');
        return done();
      }
    });
  });
});
