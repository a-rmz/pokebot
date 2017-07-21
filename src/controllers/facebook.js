const debug = require('debug')('pokebot:facebook');
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

const callSendTyping = (recipientId, messageTimeout) => {
  requestPromise({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: process.env.FB_PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id: recipientId
      },
      sender_action: 'typing_on'
    },
  })
    .then(() => {
      if (typeof messageTimeout === 'function') {
        messageTimeout();
      }
    });
};

const sendArrayMessage = (recipientId, array) => {
  for (let i = 0; i < array.length; i++) {
    const messageObject = array[i];
    const message = composeMessage(recipientId, messageObject);
    debug(message);

    ((scopedMessage, index, recipient) => {
      const text = scopedMessage.message.text;
      const textLength = (text) ? text.length : 70;
      const avgWPM = 85;
      const avgCPM = avgWPM * 7;

      const typingLength = Math.min(Math.floor(textLength / (avgCPM / 60)) * 1000, 5000);

      debug(`gonna wait for ${index * typingLength}`);
      setTimeout(
        () => {
          debug(index, 'typing…');
          debug(index, 'setting timer for send');
          callSendTyping(
            recipient,
            () => {
              setTimeout(
                () => {
                  debug('sending message:', scopedMessage.message);
                  callSendAPI(scopedMessage);
                },
                typingLength
              );
            }
          );
        },
        (index * typingLength) + (index * typingLength > 0 ? typingLength : 0)
      );
    })(message, i, recipientId);
  }
};

const receivedMessage = (event) => {
  const senderId = event.sender.id;
  const text = event.message.text;

  // Get the entities from Recast here
  const nlpResponse = recast.processMessage(text);
  // This is a separate function, in case other things as sentiment or emojis want to be extracted
  // without duplicating requests
  const entities = nlpResponse.then(response => recastUtils.getEntities(response));

  const processedMessage = entities
    .then(rawEntities => convoHandler.process(rawEntities))
    .catch(error => error);

  processedMessage
    .then((response) => {
      console.log(JSON.stringify(response, null, 2));
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
