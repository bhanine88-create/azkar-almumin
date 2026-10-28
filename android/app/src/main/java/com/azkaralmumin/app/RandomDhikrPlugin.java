package com.azkaralmumin.app;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

/** JS side: src/services/randomDhikrNative.ts. */
@CapacitorPlugin(name = "RandomDhikr")
public class RandomDhikrPlugin extends Plugin {
    @Override
    public void load() {
        RandomDhikrPopup.ensureChannel(getContext());
    }

    /** Replaces the plan with {@code items} ([{at, text}]) and arms its first slot. */
    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray items = call.getArray("items");
        JSObject style = call.getObject("style", new JSObject());
        if (items == null) {
            call.reject("items is required");
            return;
        }
        JSONArray clean = new JSONArray();
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item != null && item.optLong("at", -1) > 0 && !item.optString("text", "").isEmpty()) {
                clean.put(item);
            }
        }
        RandomDhikrSchedule.save(getContext(), clean, style);
        RandomDhikrSchedule.armNext(getContext());
        call.resolve(status());
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        RandomDhikrSchedule.clear(getContext());
        call.resolve(status());
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(status());
    }

    /** Opens Android's "Display over other apps" page for this app. */
    @PluginMethod
    public void openOverlaySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + getContext().getPackageName()));
        try {
            // Started from the activity, on top of the app's own task, so Back
            // returns to the app. As a new task it joined the Settings app's
            // task, and Back walked through whatever Settings screens were there.
            if (getActivity() != null) {
                getActivity().startActivity(intent);
            } else {
                getContext().startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            }
            call.resolve();
        } catch (RuntimeException e) {
            call.reject("Overlay settings unavailable", e);
        }
    }

    private JSObject status() {
        JSObject result = new JSObject();
        result.put("canDrawOverlays", Settings.canDrawOverlays(getContext()));
        result.put("count", RandomDhikrSchedule.items(getContext()).length());
        result.put("next", RandomDhikrSchedule.nextAt(getContext(), System.currentTimeMillis()));
        return result;
    }
}
