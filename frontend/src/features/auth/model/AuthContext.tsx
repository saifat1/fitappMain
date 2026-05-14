import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { authApi } from "../../../shared/api/authApi";
import { legalApi } from "../../../shared/api/legalApi";
import {
    getAccessToken,
    removeAccessToken,
    setAccessToken,
} from "../../../shared/lib/tokenStorage";
import type {
    CurrentUserResponse,
    LoginRequest,
    RegisterByInviteRequest,
    RegisterTrainerRequest,
} from "./auth.types";

type AuthContextValue = {
    token: string | null;
    currentUser: CurrentUserResponse | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    requiresConsent: boolean;
    login: (payload: LoginRequest) => Promise<void>;
    registerByInvite: (payload: RegisterByInviteRequest) => Promise<void>;
    registerTrainer: (payload: RegisterTrainerRequest) => Promise<void>;
    loadMe: () => Promise<void>;
    refreshConsentStatus: () => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(getAccessToken());
    const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
        null
    );
    const [isInitializing, setIsInitializing] = useState(true);
    const [requiresConsent, setRequiresConsent] = useState(false);

    const logout = useCallback(() => {
        removeAccessToken();
        setTokenState(null);
        setCurrentUser(null);
        setRequiresConsent(false);
    }, []);

    const loadMe = useCallback(async () => {
        const me = await authApi.getMe();
        setCurrentUser(me);
    }, []);

    const refreshConsentStatus = useCallback(async () => {
        const status = await legalApi.getConsentStatus();
        setRequiresConsent(status.requiresConsent);
    }, []);

    const login = useCallback(
        async (payload: LoginRequest) => {
            const response = await authApi.login(payload);

            setAccessToken(response.accessToken);
            setTokenState(response.accessToken);
            setRequiresConsent(response.requiresConsent);

            await loadMe();
        },
        [loadMe]
    );

    const registerByInvite = useCallback(
        async (payload: RegisterByInviteRequest) => {
            const response = await authApi.registerByInvite(payload);

            setAccessToken(response.accessToken);
            setTokenState(response.accessToken);
            setRequiresConsent(response.requiresConsent);

            await loadMe();
        },
        [loadMe]
    );

    const registerTrainer = useCallback(
        async (payload: RegisterTrainerRequest) => {
            const response = await authApi.registerTrainer(payload);

            setAccessToken(response.accessToken);
            setTokenState(response.accessToken);
            setRequiresConsent(response.requiresConsent);

            await loadMe();
        },
        [loadMe]
    );

    useEffect(() => {
        async function bootstrap() {
            const storedToken = getAccessToken();

            if (!storedToken) {
                setIsInitializing(false);
                return;
            }

            try {
                setTokenState(storedToken);
                await loadMe();
                await refreshConsentStatus();
            } catch {
                logout();
            } finally {
                setIsInitializing(false);
            }
        }

        void bootstrap();
    }, [loadMe, refreshConsentStatus, logout]);

    const value = useMemo(
        () => ({
            token,
            currentUser,
            isAuthenticated: Boolean(token && currentUser),
            isInitializing,
            requiresConsent,
            login,
            registerByInvite,
            registerTrainer,
            loadMe,
            refreshConsentStatus,
            logout,
        }),
        [
            token,
            currentUser,
            isInitializing,
            requiresConsent,
            login,
            registerByInvite,
            registerTrainer,
            loadMe,
            refreshConsentStatus,
            logout,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}