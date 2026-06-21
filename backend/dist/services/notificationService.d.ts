import { Server } from 'socket.io';
export declare const setIo: (io: Server) => void;
export type NotificationType = 'new_message' | 'product_sold' | 'price_drop';
export declare const sendNotification: (params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
}) => Promise<{
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
}>;
//# sourceMappingURL=notificationService.d.ts.map