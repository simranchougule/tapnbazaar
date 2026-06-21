import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=admin.middleware.d.ts.map