const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const wahaClient = axios.create({
  baseURL: config.wahaApiUrl,
  headers: {
    'X-Api-Key': config.wahaApiKey,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

exports.enviarMensagem = async (chatId, text) => {
  const payload = { chatId, text };
  const response = await wahaClient.post('/api/sendText', payload);
  logger.info('Mensagem WAHA enviada', { chatId, text, data: response.data });
  return response.data;
};

exports.enviarImagem = async (chatId, imageUrl, caption = '') => {
  const payload = { chatId, imageUrl, caption };
  const response = await wahaClient.post('/api/sendImage', payload);
  logger.info('Imagem WAHA enviada', { chatId, imageUrl });
  return response.data;
};

exports.enviarArquivo = async (chatId, fileUrl, filename) => {
  const payload = { chatId, fileUrl, filename };
  const response = await wahaClient.post('/api/sendFile', payload);
  logger.info('Arquivo WAHA enviado', { chatId, fileUrl, filename });
  return response.data;
};

exports.responderMensagem = async (chatId, text) => {
  return exports.enviarMensagem(chatId, text);
};
