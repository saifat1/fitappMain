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
    login: (payload: LoginRequest) => Promise<void>;
    registerByInvite: (payload: RegisterByInviteRequest) => Promise<void>;
    registerTrainer: (payload: RegisterTrainerRequest) => Promise<void>;
    loadMe: () => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(getAccessToken());
    const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const logout = useCallback(() => {
        removeAccessToken();
        setTokenState(null);
        setCurrentUser(null);
    }, []);

    const loadMe = useCallback(async () => {
        const me = await authApi.getMe();
        setCurrentUser(me);
    }, []);

    const login = useCallback(
        async (payload: LoginRequest) => {
            const response = await authApi.login(payload);
            setAccessToken(response.accessToken);
            setTokenState(response.accessToken);
            await loadMe();
        },
        [loadMe]
    );

    const registerByInvite = useCallback(
        async (payload: RegisterByInviteRequest) => {
            const response = await authApi.registerByInvite(payload);
            setAccessToken(response.accessToken);
            setTokenState(response.accessToken);
            await loadMe();
        },
        [loadMe]
    );

    const registerTrainer = useCallback(
        async (payload: RegisterTrainerRequest) => {
            const response = await authApi.registerTrainer(payload);
            setAccessToken(response.accessToken);
            setTokenState(response.accessToken);
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
            } catch {
                logout();
            } finally {
                setIsInitializing(false);
            }
        }

        void bootstrap();
    }, [loadMe, logout]);

    const value = useMemo(
        () => ({
            token,
            currentUser,
            isAuthenticated: Boolean(token && currentUser),
            isInitializing,
            login,
            registerByInvite,
            registerTrainer,
            loadMe,
            logout,
        }),
        [
            token,
            currentUser,
            isInitializing,
            login,
            registerByInvite,
            registerTrainer,
            loadMe,
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