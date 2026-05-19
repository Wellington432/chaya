const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const groqClient = axios.create({
  baseURL: config.groqApiUrl,
  headers: {
    Authorization: `Bearer ${config.groqApiKey}`,
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

const callGroq = async (prompt) => {
  const payload = {
    model: 'groq-1',
    input: prompt,
    max_output_tokens: 256,
    temperature: 0.2
  };
  const response = await groqClient.post('/responses', payload);
  const text = response.data?.output?.[0]?.content?.[0] || response.data?.output || '';
  return String(text).trim();
};

exports.classificarChamado = async (text) => {
  const prompt = `Classifique o texto a seguir em categoria e assunto de chamado. Responda em JSON com category, subject:\n${text}`;
  const result = await callGroq(prompt);
  try {
    const parsed = JSON.parse(result);
    return { category: parsed.category || 'Infraestrutura', subject: parsed.subject || 'Suporte via WhatsApp' };
  } catch (error) {
    logger.warn('Falha ao parsear classificação AI', { error: error.message, result });
    return { category: 'Infraestrutura', subject: text.slice(0, 80) };
  }
};

exports.gerarResposta = async (text) => {
  const prompt = `Você é uma assistente corporativa que responde o cliente de forma clara, educada e objetiva. O usuário escreveu: "${text}". Escreva uma resposta curta e confirme que o chamado foi aberto.`;
  return callGroq(prompt);
};

exports.detectarPrioridade = async (text) => {
  const prompt = `Analise o texto e determine a prioridade do chamado. Responda apenas PRIORITY em HIGH, MEDIUM ou LOW. Texto: "${text}"`;
  const result = await callGroq(prompt);
  const normalized = result.toUpperCase();
  if (normalized.includes('HIGH')) return { level: 'HIGH' };
  if (normalized.includes('LOW')) return { level: 'LOW' };
  return { level: 'MEDIUM' };
};

exports.resumirChamado = async (ticket) => {
  const prompt = `Resuma o ticket de forma profissional. Título: ${ticket.title}. Descrição: ${ticket.description}.`;
  return callGroq(prompt);
};
