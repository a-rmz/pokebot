
const router = require('express').Router();

const controller = require('../controllers/facebook');

/**
 * Validate the subscription
 */
router.get('/', controller.getWebhook);

router.post('/', controller.postWebhook);

module.exports = router;
