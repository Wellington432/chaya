const Joi = require('joi');
const prisma = require('../database/prismaClient');
const wahaService = require('../services/wahaService');
const aiService = require('../services/aiService');
const glpiService = require('../services/glpiService');
const schoolService = require('../services/schoolService');
const { cleanText } = require('../utils/sanitize');
const logger = require('../utils/logger');

const schema = Joi.object({
  chatId: Joi.string().required(),
  text: Joi.string().required()
});

exports.handleWebhook = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const chatId = cleanText(value.chatId);
    const text = cleanText(value.text);

    const school = await schoolService.findSchoolByIdentifier(chatId);
    if (!school) {
      logger.warn('Webhook recebido para escola não registrada', { chatId });
      await wahaService.responderMensagem(chatId, 'Escola não registrada no sistema');
      return res.status(404).json({ status: 'error', message: 'Escola não registrada no sistema' });
    }

    const classification = await aiService.classificarChamado(text);
    const priority = await aiService.detectarPrioridade(text);
    const answer = await aiService.gerarResposta(text);

    const ticketData = {
      title: classification.subject || 'Novo chamado via WhatsApp',
      content: text,
      urgency: priority.level,
      requester: chatId
    };

    const glpiTicket = await glpiService.abrirChamado(ticketData);

    const ticket = await prisma.ticket.create({
      data: {
        glpiId: glpiTicket.id.toString(),
        title: ticketData.title,
        description: ticketData.content,
        status: 'OPEN',
        priority: priority.level,
        category: classification.category,
        requester: chatId,
        school: {
          connect: { id: school.id }
        },
        createdBy: {
          connectOrCreate: {
            where: { email: 'whatsapp@service.local' },
            create: {
              email: 'whatsapp@service.local',
              name: 'WhatsApp Bot',
              passwordHash: '',
              role: 'USER',
              school: { connect: { id: school.id } }
            }
          }
        },
        messages: {
          create: {
            direction: 'INBOUND',
            content: text,
            provider: 'WAHA',
            chatId,
            school: { connect: { id: school.id } }
          }
        },
        interactions: {
          create: {
            type: 'CREATED',
            note: 'Ticket criado automaticamente via webhook WAHA'
          }
        }
      }
    });

    await wahaService.responderMensagem(chatId, answer);
    await prisma.message.create({
      data: {
        ticketId: ticket.id,
        direction: 'OUTBOUND',
        content: answer,
        provider: 'WAHA',
        chatId,
        school: { connect: { id: school.id } }
      }
    });

    logger.info('Webhook processado com sucesso', { chatId, ticketId: ticket.id, glpiId: glpiTicket.id });
    return res.status(201).json({ status: 'success', message: 'Ticket criado no GLPI e resposta enviada via WhatsApp.' });
  } catch (error) {
    next(error);
  }
};
