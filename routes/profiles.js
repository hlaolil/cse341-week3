const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profiles');
const { ensureAuthenticated } = require('../middleware/auth');


// Public endpoints (GET) and protected (POST, PUT, DELETE)
router.get('/', profilesController.getAllProfiles);
router.get('/:id', profilesController.getProfileById);

router.post('/', ensureAuthenticated, profilesController.createProfile);
router.put('/:id', ensureAuthenticated, profilesController.updateProfile);
router.delete('/:id', ensureAuthenticated, profilesController.deleteProfile);

module.exports = router;
