import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import businessRoutes from './modules/business/business.routes';
import receiptRoutes from './modules/receipts/receipt.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { requireAuth } from './modules/auth/middleware/requireAuth';
import { requireBusinessOwnership } from './modules/business/middleware/requireBusinessOwnership';
import { errorHandler } from './shared/middleware/errorHandler';

export function createApp() {
  const app = express();
  // BEFORE ROUTES TO TRUST RENDER'S PROXY
  app.set('trust proxy', 1);
  
  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/businesses', businessRoutes);
  app.use('/api/v1/businesses/:businessId/dashboard', requireAuth, requireBusinessOwnership, dashboardRoutes);
  app.use('/api/v1/businesses/:businessId/receipts', requireAuth, requireBusinessOwnership, receiptRoutes);

  app.use(errorHandler);
  return app;
}