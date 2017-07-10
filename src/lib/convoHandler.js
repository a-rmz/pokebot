
const pokedex = require('../controllers/pokeapi');
const { textMessage, textArrayMessage, imageMessage, cardMessage } = require('./messageFactory');

const GREETINGS = ['¡Qué onda! :D', 'Hoooola.', 'Hola. 😁', 'Wassup. 😝'];
const GOODBYES = ['¡Adiós!', 'Gracias por preguntar. 😊', 'Hasta la próxima. 👋🏼'];

const random = value => Math.floor((Math.random() * value));
const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const hasProp = (object, prop) => Object.prototype.hasOwnProperty.call(object, prop);
const hasIntent = entities => hasProp(entities, 'intent');
const hasPokemon = entities => hasProp(entities, 'pokemon');

const isType = (entities, type) => hasIntent(entities) && entities.intent === type;

const attacks = (moves, pokemon) => {
  let messages = [];
  let movesString = '';
  const length = moves.length;

  if (length > 5) {
    messages.push(`Ok, ${capitalizeFirstLetter(pokemon)} tiene ${length} movimientos, así que estos son algunos elegidos aleatoriamente:`);
    const indexes = [];

    while (indexes.length < 5) {
      const randomNumber = random(length);
      if (!indexes.includes()) {
        indexes.push(randomNumber);
      }
    }

    movesString = indexes.map((index) => {
      const move = moves[index];
      const { name } = move.move;
      return capitalizeFirstLetter(name).replace('-', ' ');
    }).join(', ').concat('.');
  } else if (length > 0) {
    messages.push(`De acuerdo, estos son los movimientos de ${capitalizeFirstLetter(pokemon)}:`);
    movesString = moves.map((move) => {
      const { name } = move.move;
      return capitalizeFirstLetter(name).replace('-', ' ');
    }).join(', ').concat('.');
  } else {
    return textArrayMessage('Humm… algo salió mal (culpa a mi creador). Inténtalo de nuevo');
  }

  messages.push(movesString);
  messages = messages.map(message => textMessage(message));

  return messages;
};

const image = (sprites, pokemon) => {
  const url = sprites.front_default;
  const header = `Un ${pokemon} se ve así:`;
  return [
    textMessage(header),
    imageMessage(url)
  ];
};

const information = (pokemonInfo, pokemon) => {
  const { weight, height, base_experience: baseXP } = pokemonInfo;
  const types = pokemonInfo.types.map(type => capitalizeFirstLetter(type.type.name));

  const title = capitalizeFirstLetter(pokemon);
  const subtitle = `Weight: ${weight}. \nHeight:${height}. \nBase XP: ${baseXP} \n${(types.length > 1) ? 'Types' : 'Type'}: ${types.join(', ')}`;
  const url = pokemonInfo.sprites.front_default;

  return [cardMessage(title, subtitle, url)];
};

const skills = (abilities, pokemon) => {
  if (abilities && abilities.length > 0) {
    const skillsArray = abilities.map(skill => capitalizeFirstLetter(skill.ability.name).replace('-', ' '));
    const skillsMessage = skillsArray.join(', ').concat('.');
    const title = `Estas son las habilidades de ${capitalizeFirstLetter(pokemon)}:`;

    return textArrayMessage(title, skillsMessage);
  }

  return textArrayMessage('Humm… algo salió mal (culpa a mi creador). Inténtalo de nuevo');
};

const process = (entities) => {
  console.log(JSON.stringify(entities, null, 2));
  if (isType(entities, 'greetings')) {
    const index = random(GREETINGS.length);
    return Promise.resolve(textArrayMessage(GREETINGS[index]));
  }

  if (isType(entities, 'goodbye')) {
    const index = random(GOODBYES.length);
    return Promise.resolve(textArrayMessage(GOODBYES[index]));
  }
  if (hasPokemon(entities)) {
    const { pokemon } = entities;
    const info = pokedex.getPokemonByName(pokemon);

    if (isType(entities, 'attacks')) {
      return info
        .then(pokemonInfo => attacks(pokemonInfo.moves, pokemon))
        .catch(() => textArrayMessage('Ammmm… ¿seguro que eso es un Pokemon?'));
    }

    if (isType(entities, 'image')) {
      return info
        .then(pokemonInfo => image(pokemonInfo.sprites, pokemon))
        .catch(() => textArrayMessage('Ammmm… ¿seguro que eso es un Pokemon?'));
    }

    if (isType(entities, 'skills')) {
      return info
        .then(pokemonInfo => skills(pokemonInfo.abilities, pokemon))
        .catch(() => textArrayMessage('Ammmm… ¿seguro que eso es un Pokemon?'));
    }

    if (isType(entities, 'information')) {
      return info
        .then(pokemonInfo => information(pokemonInfo, pokemon))
        .catch(() => textArrayMessage('Ammmm… ¿seguro que eso es un Pokemon?'));
    }

    return Promise.reject(textArrayMessage('Ammmm… ¿seguro que eso es un Pokemon?'));
  }

  return Promise.reject(textArrayMessage('Lo siento, no pude entenderte. :('));
};

module.exports = {
  process,
};
