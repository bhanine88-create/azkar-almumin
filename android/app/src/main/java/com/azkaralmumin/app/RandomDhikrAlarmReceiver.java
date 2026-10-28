package com.azkaralmumin.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Fires on each random dhikr slot: shows it, then arms the next slot. */
public class RandomDhikrAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!RandomDhikrSchedule.ACTION_SHOW.equals(intent.getAction())) return;
        final Context app = context.getApplicationContext();
        final PendingResult result = goAsync();
        String text = RandomDhikrSchedule.takeDue(app, System.currentTimeMillis());
        RandomDhikrSchedule.armNext(app);
        if (text == null || text.isEmpty()) {
            result.finish();
            return;
        }
        // The card stays up for a few seconds; keep the process alive until it is gone.
        RandomDhikrPopup.show(app, text, RandomDhikrSchedule.style(app), result::finish);
    }
}
