import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProductAdmin: (req: AuthRequest, res: Response) => Promise<void>;
export declare const banUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markTrusted: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getReports: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map