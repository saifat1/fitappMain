package ru.com.fitapp;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.widget.Toast;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * FIT-86: saves a generated file to the public "Downloads" folder and shows a short system notice.
 * The app's WebView ignores <a download>. Android 10+ needs no permission (MediaStore),
 * older versions ask for WRITE_EXTERNAL_STORAGE (declared with maxSdkVersion=28).
 */
@CapacitorPlugin(
    name = "Downloads",
    permissions = { @Permission(alias = "storage", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }) }
)
public class DownloadsPlugin extends Plugin {

    @PluginMethod
    public void save(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
            return;
        }
        writeFile(call);
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        if (getPermissionState("storage") != PermissionState.GRANTED) {
            call.reject("Нет разрешения на сохранение файлов");
            return;
        }
        writeFile(call);
    }

    private void writeFile(PluginCall call) {
        String filename = call.getString("filename");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        String notice = call.getString("notice");
        if (filename == null || data == null) {
            call.reject("Не передан файл");
            return;
        }

        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                writeToMediaStore(filename, mimeType, bytes);
            } else {
                writeToPublicFolder(filename, bytes);
            }
        } catch (IOException | IllegalArgumentException e) {
            call.reject("Не удалось сохранить файл", e);
            return;
        }

        if (notice != null) {
            getActivity().runOnUiThread(() -> Toast.makeText(getContext(), notice, Toast.LENGTH_LONG).show());
        }
        call.resolve();
    }

    /** A file with the same name is not overwritten: the system adds " (1)" to the new one. */
    private void writeToMediaStore(String filename, String mimeType, byte[] bytes) throws IOException {
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
        values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IOException("MediaStore insert failed");
        }

        try (OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) {
                throw new IOException("MediaStore stream is unavailable");
            }
            out.write(bytes);
        } catch (IOException e) {
            resolver.delete(uri, null, null);
            throw e;
        }

        values.clear();
        values.put(MediaStore.Downloads.IS_PENDING, 0);
        resolver.update(uri, values, null, null);
    }

    private void writeToPublicFolder(String filename, byte[] bytes) throws IOException {
        File folder = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        if (!folder.isDirectory() && !folder.mkdirs()) {
            throw new IOException("Downloads folder is unavailable");
        }

        int dot = filename.lastIndexOf('.');
        String name = dot > 0 ? filename.substring(0, dot) : filename;
        String extension = dot > 0 ? filename.substring(dot) : "";
        File file = new File(folder, filename);
        for (int copy = 1; file.exists(); copy++) {
            file = new File(folder, name + " (" + copy + ")" + extension);
        }

        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(bytes);
        }
    }
}
