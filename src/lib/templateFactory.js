
const scaffold = recipientId => ({
  recipient: {
    id: recipientId
  },
  message: {

  }
});

const textMessageFactory = (recipientId, messageObject) => {
  const baseMessage = scaffold(recipientId);
  baseMessage.message.text = messageObject.message;
  return baseMessage;
};

const imageMessageFactory = (recipientId, messageObject) => {
  const baseMessage = scaffold(recipientId);
  const attachment = {
    type: 'image',
    payload: {
      url: messageObject.url
    }
  };
  baseMessage.message = { attachment };
  return baseMessage;
};

const cardMessageFactory = (recipientId, messageObject) => {
  const baseMessage = scaffold(recipientId);
  const { title, url, subtitle } = messageObject;
  const attachment = {
    type: 'template',
    payload: {
      template_type: 'generic',
      elements: [
        {
          title,
          subtitle,
          image_url: url,
        }
      ],
    }
  };
  baseMessage.message = { attachment };

  return baseMessage;
};

const composeMessage = (recipientId, messageObject) => {
  const { type } = messageObject;

  switch (type) {
    case 'text':
      return textMessageFactory(recipientId, messageObject);
    case 'image':
      return imageMessageFactory(recipientId, messageObject);
    case 'card':
      return cardMessageFactory(recipientId, messageObject);
    default:
      return textMessageFactory(
        recipientId,
        'Humm… algo salió mal (culpa a mi creador). Inténtalo de nuevo'
      );
  }
};

module.exports = composeMessage;
