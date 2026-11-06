
type NotificationType =
    | 'DRIVER_VERIFICATION_APPROVED'
    | 'VEHICLE_VERIFICATION_APPROVED'
    | 'DRIVER_VERIFICATION_ISSUE'
    | 'VEHICLE_VERIFICATION_ISSUE'
    | 'DRIVER_LICENSE_EXPIRY'
    | 'VEHICLE_LICENSE_EXPIRY'
    | 'DRIVER_LICENSE_RENEWAL_APPROVED'
    | 'VEHICLE_LICENSE_RENEWAL_APPROVED'
    | 'DRIVER_LICENSE_RENEWAL_ISSUE'
    | 'VEHICLE_LICENSE_RENEWAL_ISSUE';

const notificationTemplates = [
    {
        type: 'DRIVER_VERIFICATION_APPROVED',
        title: 'Driver Verification Successful',
        body: 'Your driver verification has been approved. You can now be assigned to a verified vehicle and start accepting orders.',
        banner_title: 'Driver Verification Approved',
        banner_body: 'Your driver verification is approved! You can now be assigned to a verified vehicle.',
        category: 'Verification',
        data: {}
    },
    {
        type: 'VEHICLE_VERIFICATION_APPROVED',
        title: 'Vehicle Verification Successful',
        body: 'Your vehicle verification has been approved. You can now assign a verified driver to this vehicle and accept orders.',
        banner_title: 'Vehicle Verification Approved',
        banner_body: 'Your vehicle is approved! Assign a verified driver to start accepting orders.',
        category: 'Verification',
        data: { vehicle_id: 'vehicle-001' }
    },
    {
        type: 'DRIVER_VERIFICATION_ISSUE',
        title: 'Driver Verification Issue',
        body: 'We found an issue with your driver verification. Open Profile information to review the feedback and submit the required corrections. You won’t be able to go online or accept orders until your driver verification is approved.',
        banner_title: 'Driver Verification Issue',
        banner_body: 'Action required: Review your driver verification feedback and correct the issue.',
        category: 'Verification',
        data: { issue: 'Document details could not be verified.' }
    },
    {
        type: 'VEHICLE_VERIFICATION_ISSUE',
        title: 'Vehicle Verification Issue',
        body: 'We found an issue with your vehicle verification. Open your vehicle details to review the feedback and submit the required corrections. This vehicle cannot run order operations until its verification is approved.',
        banner_title: 'Vehicle Verification Issue',
        banner_body: 'Action required: Review your vehicle verification feedback and correct the issue.',
        category: 'Verification',
        data: { vehicle_id: 'vehicle-001', issue: 'Vehicle document requires correction.' }
    },
    {
        type: 'DRIVER_LICENSE_EXPIRY',
        title: "Driver's License Expiring Soon",
        body: "Your driver's license expires on 15 Nov 2026. Please renew it and submit your updated document before it expires to avoid interruptions to your driving activities on Nano.",
        banner_title: "Driver's License Expiring Soon",
        banner_body: "Your driver's license expires on 15 Nov 2026. Renew it before the expiry date.",
        category: 'Verification',
        data: { expiryDate: '2026-11-15' }
    },
    {
        type: 'VEHICLE_LICENSE_EXPIRY',
        title: 'Vehicle License Expiring Soon',
        body: "Your vehicle's license expires on 20 Nov 2026. Please renew it and submit the updated document before it expires to keep your vehicle eligible for orders on Nano.",
        banner_title: 'Vehicle License Expiring Soon',
        banner_body: "Your vehicle's license expires on 20 Nov 2026. Renew it before the expiry date.",
        category: 'Verification',
        data: { vehicle_id: 'vehicle-001', expiryDate: '2026-11-20' }
    },
    {
        type: 'DRIVER_LICENSE_RENEWAL_APPROVED',
        title: "Driver's License Renewal Approved",
        body: "Your renewed driver's license has been reviewed and approved. Your driver license verification is now up to date. You can go online or accept orders once you are assigned to a verified vehicle.",
        banner_title: "Driver's License Renewed",
        banner_body: "Your renewed driver's license has been approved! You're eligible to go online and accept orders with an approved vehicle.",
        category: 'Verification',
        data: {}
    },
    {
        type: 'VEHICLE_LICENSE_RENEWAL_APPROVED',
        title: 'Vehicle License Renewal Approved',
        body: "Your renewed vehicle license has been reviewed and approved. Your vehicle's license verification is now up to date. The vehicle is eligible for order operations once an approved driver is assigned.",
        banner_title: 'Vehicle License Renewed',
        banner_body: 'Your renewed vehicle license has been approved! Your vehicle is now eligible for order operations once it is assigned to a verified driver.',
        category: 'Verification',
        data: { vehicle_id: 'vehicle-001' }
    },
    {
        type: 'DRIVER_LICENSE_RENEWAL_ISSUE',
        title: "Driver's License Renewal Issue",
        body: "We found an issue with your renewed driver's license document. Open Profile information to review the feedback and submit the required corrections. Your driver license verification must be approved before you can go online or accept orders.",
        banner_title: "Driver's License Renewal Issue",
        banner_body: "We couldn't approve your renewed driver's license. Review the feedback and correct the issue.",
        category: 'Verification',
        data: { issue: 'The uploaded license image is unclear.' }
    },
    {
        type: 'VEHICLE_LICENSE_RENEWAL_ISSUE',
        title: 'Vehicle License Renewal Issue',
        body: 'We found an issue with your renewed vehicle license document. Open your vehicle details to review the feedback and submit the required corrections. This vehicle must have an approved license before it is eligible for order operations.',
        banner_title: 'Vehicle License Renewal Issue',
        banner_body: "We couldn't approve your renewed vehicle license. Review the feedback and correct the issue.",
        category: 'Verification',
        data: { vehicle_id: 'vehicle-001', issue: 'The uploaded vehicle license could not be verified.' }
    }
] as const;

const MOCK_USER_ID = '00000000-0000-4000-8000-000000000001';

export const notifications: any[] = Array.from({ length: 100 }, (_, index) => {
    const template = notificationTemplates[index % notificationTemplates.length];

    // Spread records across approximately 25 days.
    const timestamp = new Date(
        Date.UTC(2026, 10, 3, 7, 29, 26) -
        index * 6 * 60 * 60 * 1000
    );

    // Mix read and unread records.
    const isRead = index % 3 !== 0;

    return {
        id: String(index + 1),
        user_id: MOCK_USER_ID,
        app_role: 'DRIVER' as const,
        type: template.type as NotificationType,
        title: template.title,
        body: template.body,
        banner_title: template.banner_title,
        banner_body: template.banner_body,
        category: template.category,
        data: {
            ...template.data,
            notification_id: String(index + 1),
            notification_type: template.type
        },
        read_at: isRead
            ? new Date(timestamp.getTime() + 30 * 60 * 1000).toISOString()
            : null,
        created_at: timestamp.toISOString()
    };
});
