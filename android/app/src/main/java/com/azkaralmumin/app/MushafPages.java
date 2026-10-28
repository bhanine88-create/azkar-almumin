package com.azkaralmumin.app;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Madinah mushaf page images (King Fahd Complex, 604 pages), downloaded once
 * into the app's own storage and read from there afterwards, offline.
 * Callbacks always arrive on the main thread.
 */
final class MushafPages {
    static final int TOTAL = 604;
    private static final String TAG = "MushafPages";
    /** Same King Fahd page set the web reader uses (src/services/mushafService.ts). */
    private static final String[] SOURCES = {
        "https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/kfgqpc/hafs-wasat/%d.jpg",
        "https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/kfgqpc/hafs-wasat/%d.jpg",
    };
    /** Smaller than any real page; anything below is a failed or partial download. */
    private static final long MIN_BYTES = 20_000;

    interface PageListener {
        void onPage(int page, File file);
        void onFailed(int page);
    }

    interface ProgressListener {
        void onProgress(int done, int total, boolean finished, int failed);
    }

    private static final ExecutorService PAGE_POOL = Executors.newFixedThreadPool(3);
    private static final ExecutorService BULK_POOL = Executors.newSingleThreadExecutor();
    private static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static final Map<Integer, List<PageListener>> WAITING = new HashMap<>();
    private static final AtomicBoolean BULK_RUNNING = new AtomicBoolean(false);
    private static final AtomicBoolean BULK_CANCEL = new AtomicBoolean(false);
    private static ProgressListener bulkListener;
    private static int[] lastProgress = {0, TOTAL, 1, 0};

    private MushafPages() {}

    static File file(Context context, int page) {
        return new File(dir(context), page + ".jpg");
    }

    static boolean has(Context context, int page) {
        return file(context, page).length() >= MIN_BYTES;
    }

    static int downloadedCount(Context context) {
        int count = 0;
        for (int page = 1; page <= TOTAL; page++) if (has(context, page)) count++;
        return count;
    }

    /** Delivers the page file, downloading it first when needed. */
    static void get(Context context, int page, PageListener listener) {
        final Context app = context.getApplicationContext();
        if (has(app, page)) {
            listener.onPage(page, file(app, page));
            return;
        }
        synchronized (WAITING) {
            List<PageListener> waiting = WAITING.get(page);
            if (waiting != null) {
                waiting.add(listener);
                return;
            }
            waiting = new ArrayList<>();
            waiting.add(listener);
            WAITING.put(page, waiting);
        }
        PAGE_POOL.execute(() -> {
            boolean ok = download(app, page);
            final List<PageListener> done;
            synchronized (WAITING) {
                done = WAITING.remove(page);
            }
            MAIN.post(() -> {
                if (done == null) return;
                for (PageListener l : done) {
                    if (ok) l.onPage(page, file(app, page));
                    else l.onFailed(page);
                }
            });
        });
    }

    /** Warms the cache around the page being read, without callbacks. */
    static void prefetch(Context context, int page) {
        final Context app = context.getApplicationContext();
        if (page < 1 || page > TOTAL || has(app, page)) return;
        synchronized (WAITING) {
            if (WAITING.containsKey(page)) return;
            WAITING.put(page, new ArrayList<>());
        }
        PAGE_POOL.execute(() -> {
            download(app, page);
            synchronized (WAITING) {
                List<PageListener> done = WAITING.remove(page);
                if (done != null && !done.isEmpty()) {
                    boolean ok = has(app, page);
                    MAIN.post(() -> {
                        for (PageListener l : done) {
                            if (ok) l.onPage(page, file(app, page));
                            else l.onFailed(page);
                        }
                    });
                }
            }
        });
    }

    /**
     * Downloads every missing page for offline reading. Keeps running after the
     * reader closes, for as long as the app process lives; reopening the reader
     * picks the progress up again.
     */
    static void downloadAll(Context context, ProgressListener listener) {
        bulkListener = listener;
        if (!BULK_RUNNING.compareAndSet(false, true)) {
            reportBulk(lastProgress[0], lastProgress[2] == 1, lastProgress[3]);
            return;
        }
        BULK_CANCEL.set(false);
        final Context app = context.getApplicationContext();
        BULK_POOL.execute(() -> {
            int done = 0;
            int failed = 0;
            for (int page = 1; page <= TOTAL && !BULK_CANCEL.get(); page++) {
                if (has(app, page) || download(app, page)) done++;
                else failed++;
                if (page % 4 == 0) reportBulk(done, false, failed);
            }
            BULK_RUNNING.set(false);
            reportBulk(done, true, failed);
        });
    }

    static boolean isBulkRunning() {
        return BULK_RUNNING.get();
    }

    /** Stops reporting to a reader that has closed; the download itself goes on. */
    static void detach(ProgressListener listener) {
        if (bulkListener == listener) bulkListener = null;
    }

    private static void reportBulk(int done, boolean finished, int failed) {
        lastProgress = new int[]{done, TOTAL, finished ? 1 : 0, failed};
        MAIN.post(() -> {
            ProgressListener l = bulkListener;
            if (l != null) l.onProgress(done, TOTAL, finished, failed);
        });
    }

    private static File dir(Context context) {
        File dir = new File(context.getFilesDir(), "mushaf/hafs");
        if (!dir.isDirectory()) dir.mkdirs();
        return dir;
    }

    private static boolean download(Context app, int page) {
        if (has(app, page)) return true;
        // A second round after a pause rides out a brief network drop, which
        // otherwise leaves the reader showing "could not load" for that page.
        for (int round = 0; round < 2; round++) {
            for (String pattern : SOURCES) {
                if (downloadFrom(app, page, String.format(Locale.US, pattern, page))) return true;
            }
            try {
                Thread.sleep(1500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }

    private static boolean downloadFrom(Context app, int page, String url) {
        File target = file(app, page);
        File temp = new File(target.getPath() + ".part");
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setConnectTimeout(15_000);
            connection.setReadTimeout(30_000);
            connection.setRequestProperty("User-Agent", "AzkarAlmumin/Android");
            int status = connection.getResponseCode();
            if (status != 200) {
                Log.w(TAG, "page " + page + ": HTTP " + status + " from " + url);
                return false;
            }
            long bytes = 0;
            byte[] head = new byte[2];
            try (InputStream in = connection.getInputStream(); OutputStream out = new FileOutputStream(temp)) {
                byte[] buffer = new byte[32 * 1024];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    if (bytes < 2) System.arraycopy(buffer, 0, head, (int) bytes, (int) Math.min(2 - bytes, read));
                    out.write(buffer, 0, read);
                    bytes += read;
                }
            }
            // A JPEG, and a whole one: never keep an error page or a cut-off file.
            boolean jpeg = (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8;
            if (!jpeg || bytes < MIN_BYTES || !temp.renameTo(target)) {
                Log.w(TAG, "page " + page + ": rejected (jpeg=" + jpeg + ", bytes=" + bytes + ") from " + url);
                temp.delete();
                return false;
            }
            return true;
        } catch (IOException | RuntimeException e) {
            Log.w(TAG, "page " + page + ": " + e + " from " + url);
            temp.delete();
            return false;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }
}
