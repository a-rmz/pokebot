
const pokedex = require('../controllers/pokeapi');
const { textMessage, imageMessage, cardMessage } = require('./messageFactory');

const GREETINGS = ['¡Qué onda! :D', 'Hoooola.', 'Hola. 😁', 'Wassup. 😝'];

const random = value => Math.floor((Math.random() * value));
const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const hasIntent = entities => Object.prototype.hasOwnProperty.call(entities, 'intent');
const hasPokemon = entities => Object.prototype.hasOwnProperty.call(entities, 'pokemon');

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
    return ['Humm… algo salió mal (culpa a mi creador). Inténtalo de nuevo'];
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

const process = (entities) => {
  if (isType(entities, 'greetings')) {
    const index = random(GREETINGS.length);
    return Promise.resolve([GREETINGS[index]]);
  }
  if (hasPokemon(entities)) {
    const { pokemon } = entities;
    const info = pokedex.getPokemonByName(pokemon);

    if (isType(entities, 'attacks')) {
      return info
        .then(pokemonInfo => attacks(pokemonInfo.moves, pokemon))
        .catch(() => [textMessage('Ammmm… ¿seguro que eso es un Pokemon?')]);
    }

    if (isType(entities, 'image')) {
      return info
        .then(pokemonInfo => image(pokemonInfo.sprites, pokemon))
        .catch(() => [textMessage('Ammmm… ¿seguro que eso es un Pokemon?')]);
    }

    if (isType(entities, 'information')) {
      return info
        .then(pokemonInfo => information(pokemonInfo, pokemon))
        .catch(() => [textMessage('Ammmm… ¿seguro que eso es un Pokemon?')]);
    }

    return Promise.reject([textMessage('Ammmm… ¿seguro que eso es un Pokemon?')]);
  }

  return Promise.reject([textMessage('Lo siento, no pude entenderte. :(')]);
};

module.exports = {
  process,
};
