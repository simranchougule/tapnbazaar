import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTrendingProducts: (req: any, res: Response) => Promise<void>;
export declare const getNearbyProducts: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map