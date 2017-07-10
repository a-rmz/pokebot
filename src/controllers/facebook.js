
const requestPromise = require('request-promise');
const recast = require('../controllers/recast');

const convoHandler = require('../lib/convoHandler');
const recastUtils = require('../lib/recastUtils');
const composeMessage = require('../lib/templateFactory');

const isSubscribe = mode => mode === 'subscribe';
const isTokenValid = token => token === process.env.FB_VERIFY_TOKEN;

const getWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (isSubscribe(mode) && isTokenValid(token)) {
    console.log('Validating Facebook webhook');
    res.status(200).send(challenge);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
};

const callSendAPI = (message) => {
  requestPromise({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: process.env.FB_PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: message,
  })
    .then((response) => {
      if (response.statusCode === 200) {
        const { recipientId, messageId } = response;

        console.log(`Successfully sent message with id ${messageId} to recipient ${recipientId}`);
      }
    })
    .catch((error) => {
      console.error('Unable to send message.');
      console.error(error);
    });
};

const sendArrayMessage = (recipientId, array) => {
  for (let i = 0; i < array.length; i++) {
    const messageObject = array[i];
    const message = composeMessage(recipientId, messageObject);

    setTimeout(() => {
      callSendAPI(message);
    }, i * 300);
  }
};

const receivedMessage = (event) => {
  const senderId = event.sender.id;
  const text = event.message.text;

  // Get the entities from Wit here
  const nlpResponse = recast.processMessage(text);
  const entities = nlpResponse.then(response => recastUtils.getEntities(response));

  const processedMessage = entities
    .then(rawEntities => convoHandler.process(rawEntities))
    .catch(error => error);

  processedMessage
    .then((response) => {
      sendArrayMessage(senderId, response);
    })
    .catch((error) => {
      sendArrayMessage(senderId, error);
    });
};

const postWebhook = (req, res) => {
  const data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let Facebook know
    // you've successfully received the callback. Otherwise, the request
    // will time out and they will keep trying to resend.
    res.sendStatus(200);
  }
};

module.exports = {
  getWebhook,
  postWebhook,
};
