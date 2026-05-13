import { useEffect, useRef } from "react";
import { useAuth } from "../../auth/model/AuthContext";
import { analyticsApi } from "../../../shared/api/analyticsApi";

export function AppAnalyticsTracker() {
    const { isAuthenticated, currentUser } = useAuth();
    const trackedUserIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) {
            return;
        }

        if (trackedUserIdRef.current === currentUser.id) {
            return;
        }

        trackedUserIdRef.current = currentUser.id;

        void analyticsApi.track("APP_OPENED");
    }, [isAuthenticated, currentUser]);

    return null;
}