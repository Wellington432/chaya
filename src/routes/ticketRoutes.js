const express = require('express');
const { listTickets, getTicketById, escalateTicket } = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listTickets);
router.get('/:id', getTicketById);
router.post('/:id/escalate', adminMiddleware, escalateTicket);

module.exports = router;
