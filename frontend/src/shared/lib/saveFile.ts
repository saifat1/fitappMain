import { registerPlugin } from "@capacitor/core";
import { isNativeApp } from "./platform";

/** Native side: android/app/src/main/java/ru/com/fitapp/DownloadsPlugin.java */
const Downloads = registerPlugin<{
    save(options: { filename: string; data: string; mimeType: string; notice: string }): Promise<void>;
}>("Downloads");

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

/**
 * Gives a generated file to the user. In the browser — a regular download.
 * FIT-86: the store app's WebView ignores <a download>, so there the file is saved
 * to the phone's "Downloads" folder and the system shows `notice`.
 */
export async function saveFile(blob: Blob, filename: string, notice: string): Promise<void> {
    if (!isNativeApp) {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
        return;
    }

    await Downloads.save({
        filename,
        data: await blobToBase64(blob),
        mimeType: blob.type || "application/octet-stream",
        notice,
    });
}
