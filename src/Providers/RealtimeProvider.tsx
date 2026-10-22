import React, { useEffect } from 'react'
import { useAuthStore } from '../Authentication/store/authStore';
import { DRIVER_DOCUMENT_TYPE, VERIFICATION_ISSUES_SECTION } from '../constants/driver';
import { supabase } from '../lib/supabase';
import { VERIFICATION_STATUS } from '../constants/shared_user';
import { useDriverStore } from '../Driver/store/DriverStore';
import { getDriverVerificationDetails } from '../utils/getDriverVerificationDetails';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const session = useAuthStore((store) => store.session);
    const setDriverVerificationStatus = useDriverStore((store) => store.setDriverVerificationStatus)
    const setNinVerificationStatus = useDriverStore((store) => store.setNinVerificationStatus)
    const setDriverLicenseVerificationStatus = useDriverStore((store) => store.setDriverLicenseVerificationStatus)
    const setPersonalInfoVerificationIssues = useDriverStore((store) => store.setPersonalInfoVerificationIssues)
    const setIdentityInfoVerificationIssues = useDriverStore((store) => store.setIdentityInfoVerificationIssues)
    const setDriverFirstName = useDriverStore((store) => store.setDriverFirstName)
    const setDriverLastName = useDriverStore((store) => store.setDriverLastName)
    const setDriverImgKey = useDriverStore((store) => store.setDriverImgKey)
    const setCanGoLive = useDriverStore((store) => store.setCanGoLive)
    const setIsOwnerAllVehiclesApproved = useDriverStore((store) => store.setIsOwnerAllVehiclesApproved)

    const getPersonalInfoVerificationIssues = async () => {
        const { data: verification_issues_data, error: select_verification_issues_err } = await supabase
            .from("Verification_Issues")
            .select("*")
            .eq("driver_id", session?.user.id)
            .eq("section", VERIFICATION_ISSUES_SECTION.PERSONAL_INFO);

        if (select_verification_issues_err) {
            throw new Error(`Error querying Verification Issues: ${select_verification_issues_err.message}`);
        }

        setPersonalInfoVerificationIssues(verification_issues_data);
    }

    const getIdentityInfoVerificationIssues = async () => {
        const { data: verification_issues_data, error: verification_issues_data_err } = await supabase
            .from("Verification_Issues")
            .select("*")
            .eq("driver_id", session?.user.id)
            .eq("section", VERIFICATION_ISSUES_SECTION.IDENTITY_INFO);

        if (verification_issues_data_err) {
            throw new Error(`Error querying Verification Issues: ${verification_issues_data_err.message}`);
        }

        setIdentityInfoVerificationIssues(verification_issues_data);
    }




    useEffect(() => {
        const userId = session?.user.id;
        if (!userId) return;

        const applyDocumentStatus = (documentType: DRIVER_DOCUMENT_TYPE, status: VERIFICATION_STATUS) => {
            if (documentType === DRIVER_DOCUMENT_TYPE.NIN) {
                setNinVerificationStatus(status);
            } else if (documentType === DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE) {
                setDriverLicenseVerificationStatus(status);
            }
        };

        // Catch-up fetch: realtime does not replay events missed while offline
        const syncCurrentStatuses = async () => {
            try {
                const [verificationRes, documentsRes] = await Promise.all([
                    supabase
                        .from('Driver_Verification')
                        .select('verification_status')
                        .eq('driver_id', userId)
                        .single(),
                    supabase
                        .from('Driver_Documents')
                        .select('document_type, status')
                        .eq('driver_id', userId),
                ]);

                if (verificationRes.error) throw verificationRes.error;
                if (documentsRes.error) throw documentsRes.error;

                setDriverVerificationStatus(verificationRes.data.verification_status);
                documentsRes.data.forEach((doc) =>
                    applyDocumentStatus(doc.document_type, doc.status)
                );
                getDriverVerificationDetails(session, setDriverFirstName, setDriverLastName, setDriverImgKey, setDriverVerificationStatus, setCanGoLive, setIsOwnerAllVehiclesApproved);
            } catch (e) {
                console.log('Status sync failed:', e);
            }
        };

        const refetchIssues = async () => {
            try {
                await Promise.all([
                    getPersonalInfoVerificationIssues(),
                    getIdentityInfoVerificationIssues(),
                ]);
            } catch (e) {
                console.log('Issues refetch failed:', e);
            }
        };

        const channel = supabase
            .channel(`driver-status-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Driver_Verification',
                    filter: `driver_id=eq.${userId}`,
                },
                (payload) => {
                    try {
                        const status = payload.new.verification_status;
                        setDriverVerificationStatus(status);
                        if (status === VERIFICATION_STATUS.REJECTED) refetchIssues();
                        getDriverVerificationDetails(
                            session,
                            setDriverFirstName,
                            setDriverLastName,
                            setDriverImgKey,
                            setDriverVerificationStatus,
                            setCanGoLive,
                            setIsOwnerAllVehiclesApproved
                        )
                    } catch (e) {
                        console.log('Driver_Verification handler error:', e);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Driver_Documents',
                    filter: `driver_id=eq.${userId}`,
                },
                (payload) => {
                    try {
                        const { document_type, status } = payload.new;
                        applyDocumentStatus(document_type, status);
                        if (status === VERIFICATION_STATUS.REJECTED) refetchIssues();
                    } catch (e) {
                        console.log('Driver_Documents handler error:', e);
                    }
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    syncCurrentStatuses(); // fires on first connect and every reconnect
                } else if (status === 'CHANNEL_ERROR') {
                    console.log('Realtime channel error:', err);
                } else if (status === 'TIMED_OUT') {
                    console.log('Realtime subscribe timed out');
                } else if (status === 'CLOSED') {
                    console.log('Realtime channel closed');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user.id]);

    return (
        <>
            {children}
        </>
    )
}