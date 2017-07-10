
// Threshold to consider an entity as valid
const THRESHOLD = 0.66;

/**
  * Process the recast response to a more useful entity map
  * @method getEntities
  * @param  {string}    message The message to be processed
  * @return {Promise<entities>} A promise that resolves to a map of entities
  */
const getEntities = (recastResponse) => {
  const { entities, intents } = recastResponse;
  const flatEntities = {};

  Object.entries(entities).forEach(([entity, values]) => {
    const firstEnt = values[0];
    if (firstEnt.confidence > THRESHOLD) {
      flatEntities[entity] = firstEnt.value;
    }
  });

  flatEntities.intent = (intents[0].confidence > THRESHOLD) ? intents[0].slug : null;
  return flatEntities;
};

module.exports = {
  getEntities,
};
