const prisma = require('../database/prismaClient');
const glpiService = require('../services/glpiService');
const logger = require('../utils/logger');

const ESCALATION_INTERVAL_MS = 5 * 60 * 1000;

exports.startEscalationJob = () => {
  const execute = async () => {
    try {
      const tickets = await prisma.ticket.findMany({
        where: {
          status: 'OPEN',
          createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) }
        }
      });

      for (const ticket of tickets) {
        if (ticket.priority === 'HIGH') {
          await glpiService.escalarChamado(ticket.glpiId);
          await prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'ESCALATED' } });
          await prisma.escalation.create({
            data: {
              ticketId: ticket.id,
              level: 'CRITICAL',
              note: 'Escalonamento automático por tempo de espera',
              glpiReference: ticket.glpiId
            }
          });
          logger.warn('Ticket escalado automaticamente pelo job', { ticketId: ticket.id, glpiId: ticket.glpiId });
        }
      }
    } catch (error) {
      logger.error('Erro no job de escalonamento', { message: error.message });
    }
  };

  execute();
  setInterval(execute, ESCALATION_INTERVAL_MS);
};
