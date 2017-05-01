const fs = require('fs');
const builder = require('botbuilder');

let maxRetriesGlobal;

function readFile (filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf-8', (error, data) => {
      if (error) {
        return reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

function createPromptsFromObj (obj, responses) {
  let matrix = [];
  for (let i = 0; i < obj.length; i++) {
    let item = obj[i];
    let itemOptions = {
      prompt: item.prompt || `Please enter a value for ${item.id}`,
      retryPrompt: item.errorPrompt || `Please enter a correct value for ${item.id}`,
      maxRetries: item.maxRetries || maxRetriesGlobal || 3
    };

    if (item.hasOwnProperty('id') && item.hasOwnProperty('type')) {
      if (item.type !== 'choice') {
        matrix.push(function (session) {
          session.beginDialog(`/${item.id}`, itemOptions);
        });
        matrix.push(function (session, results, next) {
          session.send(item.response, results.response);
          responses[item.id] = results.response;
          if (i === obj.length - 1) {
            session.endDialogWithResult(responses);
          } else {
            next();
          }
        });
      } else {
        if (!item.hasOwnProperty('choices')) throw new Error('Choice prompt should have \'choices\' defined');

        matrix.push(function (session) {
          builder.Prompts.choice(session, itemOptions.prompt, item.choices,
                        { listStyle: builder.ListStyle.auto });
        });
        matrix.push(function (session, results, next) {
          session.send(item.response, results.response.entity);
          responses[item.id] = results.response.entity;
          if (i === obj.length - 1) {
            session.endDialogWithResult(responses);
          } else {
            next();
          }
        });
      }
    } else throw new Error('ID and type should be defined');
  }
  return matrix;
}

function createValidatorDialogsFromObj (obj) {
  let matrix = [];
  for (let i = 0; i < obj.length; i++) {
    let item = obj[i];
    let validator;
    switch (item.type) {
      case 'text':
        validator = builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
          return response.length > 0;
        });
        break;
      case 'number':
        validator = builder.DialogAction.validatedPrompt(builder.PromptType.number);
        break;
      case 'time':
        validator = builder.DialogAction.validatedPrompt(builder.PromptType.time);
        break;
      case 'email':
        validator = builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(response);
        });
        break;
      case 'url':
        validator = builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
          return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(response);
        });
        break;
      case 'choice':
        continue; // nothing to do here
      case 'none':
        break;
      default: throw new Error(`Undefined type: ${item.type}`);
    }

    matrix.push({
      id: `/${item.id}`,
      validator: validator
    });
  }
  return matrix;
}

function assignDialogsToBot (bot, matrix) {
  for (let i = 0; i < matrix.length; i++) {
    bot.dialog(matrix[i].id, matrix[i].validator);
  }
}

function executeFormFlow (file, bot, dialogname, cb) {
  readFile(file).then((data) => {
    let responses = {};
    const obj = JSON.parse(data);
    const promptsResponsesMatrix = createPromptsFromObj(obj, responses);
    const validatorDialogsMatrix = createValidatorDialogsFromObj(obj);
    assignDialogsToBot(bot, validatorDialogsMatrix);
    bot.dialog(dialogname, promptsResponsesMatrix);
    cb(null, responses);
  }).catch((error) => {
    cb(error);
  });
}

module.exports = {
  maxRetriesGlobal: maxRetriesGlobal,
  executeFormFlow: executeFormFlow
};
