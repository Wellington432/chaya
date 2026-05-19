const prisma = require('../database/prismaClient');
const { cleanText } = require('../utils/sanitize');

const normalizePhoneIdentifier = (identifier) => {
  const cleaned = cleanText(identifier || '');
  if (!cleaned) return null;
  const withoutSuffix = cleaned.split('@')[0];
  return withoutSuffix.replace(/[^0-9]/g, '');
};

exports.findSchoolByIdentifier = async (phoneOrCode) => {
  const raw = cleanText(phoneOrCode || '');
  if (!raw) return null;

  const phone = normalizePhoneIdentifier(raw);
  const code = raw.includes('@') ? null : raw.toUpperCase().replace(/\s+/g, '');

  const conditions = [];
  if (code) {
    conditions.push({ code });
  }
  if (phone) {
    conditions.push({ users: { some: { phone } } });
  }

  if (!conditions.length) {
    return null;
  }

  const school = await prisma.school.findFirst({
    where: {
      active: true,
      OR: conditions
    }
  });

  return school;
};
