const prisma = require('../database/prismaClient');
const glpiService = require('../services/glpiService');

exports.listTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { messages: true, escalations: true }
    });
    res.json({ status: 'success', data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { messages: true, escalations: true }
    });
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket não encontrado.' });
    }

    const glpiTicket = await glpiService.buscarChamado(ticket.glpiId);
    res.json({ status: 'success', data: { local: ticket, glpi: glpiTicket } });
  } catch (error) {
    next(error);
  }
};

exports.escalateTicket = async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket não encontrado.' });
    }

    const glpiResponse = await glpiService.escalarChamado(ticket.glpiId);
    const escalation = await prisma.escalation.create({
      data: {
        ticketId: ticket.id,
        level: 'CRITICAL',
        note: 'Chamado escalado automaticamente via painel API.',
        glpiReference: glpiResponse.id?.toString() || ticket.glpiId
      }
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'ESCALATED' }
    });

    res.json({ status: 'success', data: escalation });
  } catch (error) {
    next(error);
  }
};
