const sanitizeHtml = require('sanitize-html');

const cleanText = (value = '') => {
  const result = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    allowedSchemes: [],
    textFilter: (text) => text.trim()
  });
  return result.replace(/\s+/g, ' ').trim();
};

const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    acc[key] = typeof value === 'string' ? cleanText(value) : cleanObject(value);
    return acc;
  }, {});
};

module.exports = { cleanText, cleanObject };
