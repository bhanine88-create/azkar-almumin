package com.azkaralmumin.app;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.lang.ref.WeakReference;

/** JS side: src/services/reminderCardNative.ts. */
@CapacitorPlugin(name = "ReminderCard")
public class ReminderCardPlugin extends Plugin {
    private static WeakReference<ReminderCardPlugin> instance = new WeakReference<>(null);
    private static String pendingRoute;

    @Override
    public void load() {
        instance = new WeakReference<>(this);
        if (pendingRoute != null) {
            emitRoute(pendingRoute);
            pendingRoute = null;
        }
    }

    /** Replaces the planned reminder cards ([{at, title, body, route, kind}]) and arms the first. */
    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray items = call.getArray("items");
        JSONArray clean = new JSONArray();
        if (items != null) {
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item != null && item.optLong("at", -1) > 0 && !item.optString("title", "").isEmpty()) {
                    clean.put(item);
                }
            }
        }
        ReminderCardSchedule.save(getContext(), clean);
        ReminderCardSchedule.armNext(getContext());
        JSObject result = new JSObject();
        result.put("count", clean.length());
        result.put("next", ReminderCardSchedule.nextAt(getContext(), System.currentTimeMillis()));
        call.resolve(result);
    }

    /** A card's "Read now" opened the app: tell JS which page to show. */
    static void openRoute(String route) {
        ReminderCardPlugin plugin = instance.get();
        if (plugin == null) {
            pendingRoute = route;
            return;
        }
        plugin.emitRoute(route);
    }

    private void emitRoute(String route) {
        JSObject data = new JSObject();
        data.put("route", route);
        // Retained until JS has attached its listener (cold start).
        notifyListeners("openRoute", data, true);
    }
}
