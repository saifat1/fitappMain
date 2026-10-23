import { useEffect, useState } from "react";
import { APP_VERSION, BUILD_COMMIT, BUILD_TIME, formatBuildDate, platformLabel } from "../lib/appVersion";
import { publicApi, type ServerVersion } from "../api/publicApi";

/**
 * FIT-74: «FitApp 1.0.0 · сайт · сборка abc1234 от …» and the server's build under it — shows at a glance
 * whether the phone app lags behind the site and the server.
 */
export default function AppVersionInfo() {
    const [server, setServer] = useState<ServerVersion | null>(null);

    useEffect(() => {
        publicApi.getVersion().then(setServer).catch(() => undefined);
    }, []);

    return (
        <div className="fb-app-version">
            <div>
                FitApp {APP_VERSION} · {platformLabel()} · сборка {BUILD_COMMIT} от {formatBuildDate(BUILD_TIME)}
            </div>
            {server ? (
                <div>
                    Сервер: сборка {server.commit} · запущен {formatBuildDate(server.startedAt)}
                </div>
            ) : null}
        </div>
    );
}
