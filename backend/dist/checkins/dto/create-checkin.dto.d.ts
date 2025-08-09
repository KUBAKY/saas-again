export declare class CreateCheckInDto {
    memberId: string;
    storeId: string;
    checkInMethod?: 'manual' | 'qr_code' | 'facial_recognition';
    deviceInfo?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
}
