import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getOrCreateChat: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyChats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getChatMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUnreadCount: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSingleChat: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map