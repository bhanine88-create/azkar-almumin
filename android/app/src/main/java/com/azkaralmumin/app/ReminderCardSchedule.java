package com.azkaralmumin.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Morning / evening adhkar reminder cards planned by JS ({at, title, body,
 * route, kind}) and the one alarm that walks them, as RandomDhikrSchedule does
 * for random dhikr. The adhkar notification itself is still posted by
 * @capacitor/local-notifications at the same minute.
 */
final class ReminderCardSchedule {
    static final String ACTION_SHOW = "com.azkaralmumin.app.action.REMINDER_CARD";
    private static final String PREFS = "reminder_cards";
    private static final String KEY_ITEMS = "items";
    private static final String KEY_LAST_SHOWN = "last_shown_at";
    private static final int REQUEST_CODE = 7302;
    private static final long EARLY_MS = 30_000;
    /** A reminder missed by more than this (phone off, Doze) is not shown late. */
    private static final long LATE_MS = 15 * 60_000;

    private ReminderCardSchedule() {}

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void save(Context context, JSONArray items) {
        prefs(context).edit().putString(KEY_ITEMS, items.toString()).apply();
    }

    static JSONArray items(Context context) {
        try {
            return new JSONArray(prefs(context).getString(KEY_ITEMS, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    /** The earliest reminder still ahead of {@code now} and not yet shown, or -1. */
    static long nextAt(Context context, long now) {
        JSONArray items = items(context);
        long after = Math.max(now, prefs(context).getLong(KEY_LAST_SHOWN, 0));
        long next = -1;
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            long at = item == null ? -1 : item.optLong("at", -1);
            if (at > after && (next < 0 || at < next)) next = at;
        }
        return next;
    }

    /** The reminder due now, marked as shown so a repeated alarm shows it once; or null. */
    static JSONObject takeDue(Context context, long now) {
        JSONArray items = items(context);
        JSONObject due = null;
        long dueAt = -1;
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null) continue;
            long at = item.optLong("at", -1);
            if (at <= now + EARLY_MS && at >= now - LATE_MS && at > dueAt) {
                dueAt = at;
                due = item;
            }
        }
        if (due == null || dueAt <= prefs(context).getLong(KEY_LAST_SHOWN, 0)) return null;
        prefs(context).edit().putLong(KEY_LAST_SHOWN, dueAt).apply();
        return due;
    }

    static void armNext(Context context) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null) return;
        PendingIntent intent = alarmIntent(context);
        long next = nextAt(context, System.currentTimeMillis());
        if (next < 0) {
            alarms.cancel(intent);
            return;
        }
        boolean exact = Build.VERSION.SDK_INT < 31 || alarms.canScheduleExactAlarms();
        if (exact) {
            alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, intent);
        } else {
            alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, intent);
        }
    }

    private static PendingIntent alarmIntent(Context context) {
        Intent intent = new Intent(context, ReminderCardReceiver.class).setAction(ACTION_SHOW);
        return PendingIntent.getBroadcast(context, REQUEST_CODE, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
