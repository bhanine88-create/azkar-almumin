package com.azkaralmumin.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Alarms do not survive a reboot or an app update, and a clock or time zone
 * change moves every slot. Re-arm the next random dhikr slot after each.
 */
public class RandomDhikrBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        RandomDhikrSchedule.armNext(context.getApplicationContext());
    }
}
