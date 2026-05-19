const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const config = require('./config');

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(loggerMiddleware);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Muitas solicitações. Tente novamente em um minuto.' }
});

app.use(limiter);

app.use('/auth', authRoutes);
app.use('/', webhookRoutes);
app.use('/tickets', ticketRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use(errorMiddleware);

module.exports = app;
