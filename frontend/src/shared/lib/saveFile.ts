import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { isNativeApp } from "./platform";

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
 * FIT-86: the store app's WebView ignores <a download>, so there the file goes to the app cache
 * and the system share sheet opens (save to files, open in a PDF viewer, send to a messenger).
 */
export async function saveFile(blob: Blob, filename: string): Promise<void> {
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

    const { uri } = await Filesystem.writeFile({
        path: filename,
        data: await blobToBase64(blob),
        directory: Directory.Cache,
    });

    try {
        await Share.share({ title: filename, url: uri, dialogTitle: "Сохранить или отправить файл" });
    } catch (error) {
        // Closing the share sheet without choosing an app is not an error.
        if (!(error instanceof Error && /cancel/i.test(error.message))) {
            throw error;
        }
    }
}
