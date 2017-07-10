
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

module.exports = {
  textMessage,
  imageMessage,
  cardMessage
};
