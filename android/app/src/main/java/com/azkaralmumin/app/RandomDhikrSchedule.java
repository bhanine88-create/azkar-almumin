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
 * The random dhikr plan written by JS (slot time + text) and the one alarm that
 * walks it. Only the next slot is ever armed, so random dhikr uses a single
 * alarm however many slots the plan holds.
 */
final class RandomDhikrSchedule {
    static final String ACTION_SHOW = "com.azkaralmumin.app.action.RANDOM_DHIKR";
    private static final String PREFS = "random_dhikr";
    private static final String KEY_ITEMS = "items";
    private static final String KEY_STYLE = "style";
    private static final String KEY_LAST_SHOWN = "last_shown_at";
    private static final int REQUEST_CODE = 7301;
    /** An alarm delivered this much before its slot still shows that slot. */
    private static final long EARLY_MS = 30_000;
    /** A slot missed by more than this (phone off, Doze) is skipped, not shown late. */
    private static final long LATE_MS = 10 * 60_000;

    private RandomDhikrSchedule() {}

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void save(Context context, JSONArray items, JSONObject style) {
        prefs(context).edit()
            .putString(KEY_ITEMS, items.toString())
            .putString(KEY_STYLE, style.toString())
            .apply();
    }

    static void clear(Context context) {
        prefs(context).edit().clear().apply();
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms != null) alarms.cancel(alarmIntent(context));
    }

    static JSONArray items(Context context) {
        try {
            return new JSONArray(prefs(context).getString(KEY_ITEMS, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    static JSONObject style(Context context) {
        try {
            return new JSONObject(prefs(context).getString(KEY_STYLE, "{}"));
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    /** The earliest slot still ahead of {@code now} and not yet shown, or -1. */
    static long nextAt(Context context, long now) {
        JSONArray items = items(context);
        long after = Math.max(now, prefs(context).getLong(KEY_LAST_SHOWN, 0));
        long next = -1;
        for (int i = 0; i < items.length(); i++) {
            long at = items.optJSONObject(i) == null ? -1 : items.optJSONObject(i).optLong("at", -1);
            if (at > after && (next < 0 || at < next)) next = at;
        }
        return next;
    }

    /**
     * The text of the slot due now, or null. Marks it shown, so an alarm that is
     * delivered twice for one slot shows it once.
     */
    static String takeDue(Context context, long now) {
        JSONArray items = items(context);
        long dueAt = -1;
        String text = null;
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null) continue;
            long at = item.optLong("at", -1);
            if (at <= now + EARLY_MS && at >= now - LATE_MS && at > dueAt) {
                dueAt = at;
                text = item.optString("text", null);
            }
        }
        if (dueAt < 0 || dueAt <= prefs(context).getLong(KEY_LAST_SHOWN, 0)) return null;
        prefs(context).edit().putLong(KEY_LAST_SHOWN, dueAt).apply();
        return text;
    }

    /** Arms the alarm for the next slot, or clears it when the plan has run out. */
    static void armNext(Context context) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null) return;
        PendingIntent intent = alarmIntent(context);
        long next = nextAt(context, System.currentTimeMillis());
        if (next < 0) {
            alarms.cancel(intent);
            return;
        }
        // Same rule as the other reminders: exact when Android allows it, else
        // the Doze-safe inexact alarm (a few minutes of drift, never a redirect).
        boolean exact = Build.VERSION.SDK_INT < 31 || alarms.canScheduleExactAlarms();
        if (exact) {
            alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, intent);
        } else {
            alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, intent);
        }
    }

    private static PendingIntent alarmIntent(Context context) {
        Intent intent = new Intent(context, RandomDhikrAlarmReceiver.class).setAction(ACTION_SHOW);
        return PendingIntent.getBroadcast(context, REQUEST_CODE, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
