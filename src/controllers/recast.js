
const Recastai = require('recastai').request;

class RecastController {
  constructor(token) {
    this.client = new Recastai(token, 'es');
  }

  /**
  * Process the messages coming from the NLP processor and return recasth
  * the generic format
  *
  * @param  {string} message:         A message array coming from the NLP
    * @return Recast API response:         The messages recasth the generic format
  * */
  processMessage(message) {
    return this.client.converseText(message);
  }
}

const token = process.env.RECAST_TOKEN;
const controller = new RecastController(token);

module.exports = controller;
