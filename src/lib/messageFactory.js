
const textMessage = message => ({
  type: 'text',
  message
});

const imageMessage = url => ({
  type: 'image',
  url
});

const cardMessage = (title, subtitle, url) => ({
  type: 'card',
  title,
  subtitle,
  url
});

const textArrayMessage = (...textArray) => textArray.map(text => textMessage(text));

module.exports = {
  textMessage,
  textArrayMessage,
  imageMessage,
  cardMessage
};
