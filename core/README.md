## Synopsis

FormFlow for Microsoft BotBuilder node.js SDK.
C# BotBuilder SDK has a nice little thing called [FormFlow](https://docs.botframework.com/en-us/csharp/builder/formflow/) which basically allows you to specify a C# class which, based on its fields, can generate various question/answer pairs to get some results back from the user.

## Code Example

You start by specifying a JSON file

```
[
    {
        "id": "firstname",
        "prompt": "please enter a name",
        "response": "Your name is %s",
        "errorPrompt": "please enter a string of > 0 characters",
        "type": "text"
    },
    {
        "id": "language",
        "prompt": "please select a language",
        "response": "Your favorite programming language is %s",
        "errorPrompt": "please select one of the choices",
        "type": "choice",
        "choices": "JavaScript|TypeScript|CoffeeScript"
    },
    {
        "id": "email",
        "prompt": "please enter an email",
        "response": "Your email is %s",
        "errorPrompt": "please enter a valid email",
        "type": "email"
    },
    {
        "id": "url",
        "prompt": "please enter a website (starting with http:// or https://)",
        "response": "Your url is %s",
        "errorPrompt": "please enter a valid website",
        "type": "url"
    }
]
```
You need to specify
- id: that is the name of the field you want to get filled by the user
- prompt: the question to be asked to the user
- response: the response the bot will give to the user
- errorPrompt: the error to be described at the user
- type: this can be 'text','email','number','url','time','choice'
- choices: this only work for the 'choice' type, you specify the choices separated by a pipe


## Motivation

The absense of a FormFlow library for the Node.js BotBuilder SDK.

## Installation

Create a new bot and get the libraries using npm

```
npm init
npm install --save botbuilder
npm install --save formflowbotbuilder
```

Create a new sample.json file and insert the necessary steps using the format we described above.
Create a file called app.js

```
const builder = require('botbuilder');
const formflowbotbuilder = require('formflowbotbuilder');

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

//just a name for the dialog
const myDialogName = 'getFields';

formflowbotbuilder.initializeFormFlow('./sample.json', bot, myDialogName).then(function (responses) {
    bot.dialog('/', [function (session) {
        session.beginDialog(myDialogName);
    },
    function (session, results) {
        //responses from the user are in results variable as well as in the responses callback argument
        session.send('results: ' + JSON.stringify(results));
    }]);
}).catch((error) => console.log(error));
```

## License

MIT