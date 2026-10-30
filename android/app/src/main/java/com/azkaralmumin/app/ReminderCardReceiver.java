package com.azkaralmumin.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import org.json.JSONObject;

/** Fires on each adhkar reminder: shows its card, then arms the next one. */
public class ReminderCardReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ReminderCardSchedule.ACTION_SHOW.equals(intent.getAction())) return;
        final Context app = context.getApplicationContext();
        final PendingResult result = goAsync();
        JSONObject due = ReminderCardSchedule.takeDue(app, System.currentTimeMillis());
        ReminderCardSchedule.armNext(app);
        if (due == null) {
            result.finish();
            return;
        }
        ReminderCardPopup.show(app, due, result::finish);
    }
}
