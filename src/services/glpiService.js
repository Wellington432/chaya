const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { redisClient } = require('../integrations/redisClient');

const glpiClient = axios.create({
  baseURL: config.glpiUrl,
  headers: {
    'App-Token': config.glpiAppToken,
    Authorization: `user_token ${config.glpiUserToken}`,
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

const parseResponse = (response) => {
  if (response.data?.data) return response.data.data;
  return response.data;
};

exports.abrirChamado = async ({ title, content, urgency, requester }) => {
  const payload = {
    input: {
      name: title,
      content,
      urgency: urgency === 'HIGH' ? 4 : urgency === 'LOW' ? 2 : 3,
      status: 1,
      itilcategories_id: 0,
      users_id_recipient: requester
    }
  };

  const response = await glpiClient.post('/Ticket', payload);
  const data = parseResponse(response);
  logger.info('Chamado GLPI aberto', { title, urgency, requester, response: data });
  return { id: data.id || data, raw: data };
};

exports.buscarChamado = async (glpiId) => {
  const cacheKey = `glpi:ticket:${glpiId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = await glpiClient.get(`/Ticket/${glpiId}`);
  const data = parseResponse(response);
  await redisClient.set(cacheKey, JSON.stringify(data), { EX: 120 });
  return data;
};

exports.atualizarChamado = async (glpiId, updates) => {
  const payload = { input: updates };
  const response = await glpiClient.put(`/Ticket/${glpiId}`, payload);
  const data = parseResponse(response);
  await redisClient.del(`glpi:ticket:${glpiId}`);
  logger.info('Chamado GLPI atualizado', { glpiId, updates });
  return data;
};

exports.listarChamados = async () => {
  const response = await glpiClient.get('/Ticket');
  const data = parseResponse(response);
  return Array.isArray(data) ? data : [data];
};

exports.escalarChamado = async (glpiId) => {
  const updates = { urgency: 4, status: 4, comment: 'Escalação crítica automática.' };
  const response = await glpiClient.put(`/Ticket/${glpiId}`, { input: updates });
  const data = parseResponse(response);
  await redisClient.del(`glpi:ticket:${glpiId}`);
  logger.warn('Chamado GLPI escalado', { glpiId });
  return data;
};
