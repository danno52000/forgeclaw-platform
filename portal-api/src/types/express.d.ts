// Custom Express type extensions for ForgeClaw Portal API

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        advisorId?: string;
      };
    }
  }
}

export {};
