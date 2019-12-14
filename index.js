const https = require("https");
const inquirer = require("inquirer");
const CLISpinner = require("clui");

function CreateAPICall(answers) {
  const hostnameFormatted = answers.hostname.replace("https://", "");
  var options = {
    method: answers.method,
    hostname: hostnameFormatted,
    path: answers.path,
    headers: {
      Authorization: answers.authorization,
      "cache-control": "no-cache"
    }
  };

  var req = https.request(options, function(res) {
    var chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
    });

    res.on("end", function() {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  req.end();
}

function KeepAlive(answers) {
  var Spinner = CLISpinner.Spinner;
  var counter = 0;
  var countdown = new Spinner("Sending Keep Alive", [
    "⣾",
    "⣽",
    "⣻",
    "⢿",
    "⡿",
    "⣟",
    "⣯",
    "⣷"
  ]);

  countdown.start();

  setInterval(function() {
    countdown.message("Keep alive in " + counter + " seconds...  ");
    if (counter === 0) {
      process.stdout.write("\n");
      counter = answers.holdTime * 1000;
      CreateAPICall(answers);
    }
    counter--;
  }, 1000);
}

inquirer
  .prompt([
    {
      type: "input",
      name: "hostname",
      message: "Enter Domain:",
      validate: function(value) {
        var validation = value.match(
          /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b/i
        );
        if (validation) {
          return true;
        }
        return "Please enter a valid Domain name (https://google.com)!";
      }
    },
    {
      type: "input",
      name: "path",
      message: "Enter Path:",
      validate: function(value) {
        var validation = value.match(/^\/(([A-z0-9\-\%]+\/)*[A-z0-9\-\%]+$)?/i);
        if (validation) {
          return true;
        }
        return "Please enter a valid path name (/test/path)!";
      }
    },
    {
      type: "list",
      name: "method",
      message: "What type of http request method?",
      choices: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    },
    {
      type: "input",
      name: "authorization",
      message: "Is there any authorization header?"
    },
    {
      type: "number",
      name: "holdTime",
      message: "After how many minutes should it check in?",
      default: function() {
        return 5;
      },
      validate: function(value) {
        return typeof value === "number"
          ? true
          : "Please enter a number value.";
      }
    }
  ])
  .then(answers => {
    KeepAlive(answers);
  });
