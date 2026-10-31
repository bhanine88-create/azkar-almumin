package com.azkaralmumin.app;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

import java.lang.ref.WeakReference;
import java.util.HashSet;
import java.util.Iterator;
import java.util.TreeSet;

/** JS side: src/services/mushafNative.ts. */
@CapacitorPlugin(name = "Mushaf")
public class MushafPlugin extends Plugin {
    private static WeakReference<MushafPlugin> instance = new WeakReference<>(null);

    @Override
    public void load() {
        instance = new WeakReference<>(this);
    }

    /** Opens the reader at {@code page}, or at the last page read when absent. */
    @PluginMethod
    public void open(PluginCall call) {
        if (getActivity() == null) {
            call.reject("No activity");
            return;
        }
        Intent intent = new Intent(getActivity(), MushafActivity.class);
        intent.putExtra(MushafActivity.EXTRA_PAGE, call.getInt("page", 0));
        intent.putExtra(MushafActivity.EXTRA_SURAH_NAMES, strings(call.getArray("surahNames")));
        intent.putExtra(MushafActivity.EXTRA_SURAH_STARTS, ints(call.getArray("surahStartPages")));
        intent.putExtra(MushafActivity.EXTRA_JUZ_STARTS, ints(call.getArray("juzStartPages")));
        intent.putExtra(MushafActivity.EXTRA_ARABIC_DIGITS, call.getBoolean("arabicDigits", true));
        intent.putExtra(MushafActivity.EXTRA_RTL, call.getBoolean("rtl", true));
        Bundle labels = new Bundle();
        JSObject given = call.getObject("labels", new JSObject());
        for (Iterator<String> keys = given.keys(); keys.hasNext(); ) {
            String key = keys.next();
            labels.putString(key, given.optString(key));
        }
        intent.putExtra(MushafActivity.EXTRA_LABELS, labels);
        getActivity().startActivity(intent);
        call.resolve();
    }

    /**
     * Starts downloading every missing page in the background, quietly. Called
     * at app start, as the app used to pre-cache the web Hafs edition, so pages
     * open instantly and offline.
     */
    @PluginMethod
    public void prefetchAll(PluginCall call) {
        if (MushafPages.downloadedCount(getContext()) < MushafPages.TOTAL) {
            MushafPages.downloadAll(getContext(), null);
        }
        call.resolve();
    }

    @PluginMethod
    public void getState(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(MushafActivity.PREFS, android.content.Context.MODE_PRIVATE);
        JSArray marks = new JSArray();
        for (String page : new TreeSet<>(prefs.getStringSet(MushafActivity.KEY_BOOKMARKS, new HashSet<>()))) {
            try {
                marks.put(Integer.parseInt(page));
            } catch (NumberFormatException ignored) {
                // Not a page number.
            }
        }
        JSObject result = new JSObject();
        result.put("lastPage", prefs.getInt(MushafActivity.KEY_LAST_PAGE, 0));
        result.put("bookmarks", marks);
        result.put("downloadedPages", MushafPages.downloadedCount(getContext()));
        result.put("totalPages", MushafPages.TOTAL);
        call.resolve(result);
    }

    /** Called by MushafActivity when the reader closes, so JS can refresh "continue reading". */
    static void notifyClosed(int lastPage) {
        MushafPlugin plugin = instance.get();
        if (plugin == null) return;
        JSObject data = new JSObject();
        data.put("lastPage", lastPage);
        plugin.notifyListeners("closed", data);
    }

    private static String[] strings(JSONArray array) {
        if (array == null) return null;
        String[] out = new String[array.length()];
        for (int i = 0; i < out.length; i++) out[i] = array.optString(i);
        return out;
    }

    private static int[] ints(JSONArray array) {
        if (array == null) return null;
        int[] out = new int[array.length()];
        for (int i = 0; i < out.length; i++) out[i] = array.optInt(i);
        return out;
    }
}
