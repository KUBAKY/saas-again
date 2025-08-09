import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { Store } from './store.entity';
export declare class CheckIn extends BaseEntity {
    checkInTime: Date;
    checkOutTime?: Date;
    method: 'manual' | 'qr_code' | 'nfc' | 'app';
    deviceInfo?: string;
    notes?: string;
    memberId: string;
    storeId: string;
    member: Member;
    store: Store;
    getDuration(): number | null;
    isCurrentlyInside(): boolean;
    checkOut(time?: Date): void;
}
