import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const reportProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reportUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductReports: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserReports: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=report.controller.d.ts.map