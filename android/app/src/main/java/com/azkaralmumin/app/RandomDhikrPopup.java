package com.azkaralmumin.app;

import android.app.KeyguardManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONObject;

/**
 * Shows one random dhikr for a few seconds, silently.
 *
 * With "display over other apps" allowed it is the app's own card, drawn over
 * whatever is on screen; otherwise (or on the lock screen) a silent heads-up
 * notification that removes itself after the same time, so nothing piles up in
 * the shade. Nothing is shown while the screen is off, and nothing while the
 * app is open, where the in-app card already shows the same slot.
 */
final class RandomDhikrPopup {
    static final String CHANNEL_ID = "random_dhikr_popup";
    /** Replaced by CHANNEL_ID: it had a sound, and a channel's sound cannot be changed. */
    static final String OLD_CHANNEL_ID = "random_dhikr_channel";
    static final long VISIBLE_MS = 3000;
    private static final long FADE_MS = 250;
    private static final int NOTIFICATION_ID = 7301;
    private static final String DEFAULT_TITLE = "لا تنسى ذكر الله";

    private RandomDhikrPopup() {}

    static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        manager.deleteNotificationChannel(OLD_CHANNEL_ID);
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return;
        // HIGH importance is what lets it pop up on screen; no sound, no vibration.
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID, "الذكر العشوائي / Random Dhikr", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("بطاقة ذكر صامتة تظهر بضع ثوانٍ ثم تختفي");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.enableLights(false);
        channel.setShowBadge(false);
        manager.createNotificationChannel(channel);
    }

    /** Must be called on the main thread; {@code done} runs once nothing is left on screen. */
    static void show(Context context, String text, JSONObject style, Runnable done) {
        PowerManager power = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        boolean screenOn = power == null || power.isInteractive();
        boolean appHandlesIt = MainActivity.isInForeground() && style.optBoolean("inAppWhenOpen", true);
        if (!screenOn || appHandlesIt) {
            done.run();
            return;
        }
        KeyguardManager keyguard = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
        boolean locked = keyguard != null && keyguard.isKeyguardLocked();
        if (!locked && Settings.canDrawOverlays(context) && showCard(context, text, style, done)) return;
        postNotification(context, text, style);
        done.run();
    }

    private static boolean showCard(Context context, String text, JSONObject style, Runnable done) {
        final WindowManager windows = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        if (windows == null) return false;
        final View card = buildCard(context, text, style);
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT);
        params.setTitle("RandomDhikrCard");
        placeCard(context, params, style.optString("position", "top-left"));
        try {
            windows.addView(card, params);
        } catch (RuntimeException e) {
            // Permission revoked between the check and now, or no window token.
            return false;
        }

        final Handler handler = new Handler(Looper.getMainLooper());
        final boolean[] removed = {false};
        final Runnable remove = () -> {
            if (removed[0]) return;
            removed[0] = true;
            handler.removeCallbacksAndMessages(null);
            card.animate().alpha(0f).translationY(-dp(context, 12)).setDuration(FADE_MS).withEndAction(() -> {
                try {
                    windows.removeView(card);
                } catch (RuntimeException ignored) {
                    // Already gone with its window.
                }
                done.run();
            }).start();
        };
        card.setOnClickListener(v -> remove.run());
        card.setAlpha(0f);
        card.setTranslationY(-dp(context, 12));
        card.animate().alpha(1f).translationY(0f).setDuration(FADE_MS).start();
        handler.postDelayed(remove, VISIBLE_MS);
        return true;
    }

    /** Mirrors the in-app card in Layout.tsx: title, short yellow line, the dhikr. */
    private static View buildCard(Context context, String text, JSONObject style) {
        LinearLayout card = new LinearLayout(context);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setGravity(Gravity.CENTER_HORIZONTAL);
        card.setPadding(dp(context, 18), dp(context, 12), dp(context, 18), dp(context, 14));
        card.setMinimumWidth(dp(context, 190));
        card.setElevation(dp(context, 10));
        card.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);

        int background = color(style, "background", "#059669");
        GradientDrawable shape = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
            new int[]{background, color(style, "background2", style.optString("background", "#059669"))});
        shape.setCornerRadius(dp(context, 19));
        shape.setStroke(dp(context, 2), color(style, "border", "#FFFFFF"));
        card.setBackground(shape);

        TextView title = new TextView(context);
        title.setText(style.optString("title", DEFAULT_TITLE));
        title.setTextColor(color(style, "titleColor", "#FFFFFF"));
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);
        card.addView(title);

        View line = new View(context);
        GradientDrawable lineShape = new GradientDrawable();
        lineShape.setColor(Color.parseColor("#FACC15"));
        lineShape.setCornerRadius(dp(context, 2));
        line.setBackground(lineShape);
        LinearLayout.LayoutParams lineParams = new LinearLayout.LayoutParams(dp(context, 48), dp(context, 2));
        lineParams.setMargins(0, dp(context, 5), 0, dp(context, 7));
        card.addView(line, lineParams);

        TextView body = new TextView(context);
        body.setText(text);
        body.setTextColor(color(style, "textColor", "#FFFFFF"));
        body.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        body.setTypeface(Typeface.DEFAULT_BOLD);
        body.setGravity(Gravity.CENTER);
        body.setMaxWidth(dp(context, 260));
        body.setMaxLines(4);
        body.setEllipsize(TextUtils.TruncateAt.END);
        card.addView(body);
        return card;
    }

    private static void placeCard(Context context, WindowManager.LayoutParams params, String position) {
        int margin = dp(context, 12);
        int top = statusBarHeight(context) + dp(context, 8);
        int bottom = dp(context, 84);
        params.x = margin;
        params.y = top;
        switch (position) {
            case "top-right": params.gravity = Gravity.TOP | Gravity.RIGHT; break;
            case "top-center": params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL; params.x = 0; break;
            case "bottom-left": params.gravity = Gravity.BOTTOM | Gravity.LEFT; params.y = bottom; break;
            case "bottom-right": params.gravity = Gravity.BOTTOM | Gravity.RIGHT; params.y = bottom; break;
            case "bottom-center": params.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL; params.x = 0; params.y = bottom; break;
            case "center": params.gravity = Gravity.CENTER; params.x = 0; params.y = 0; break;
            case "top-left":
            default: params.gravity = Gravity.TOP | Gravity.LEFT; break;
        }
    }

    private static void postNotification(Context context, String text, JSONObject style) {
        ensureChannel(context);
        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_notify)
            .setColor(Color.parseColor("#0D9488"))
            .setContentTitle(style.optString("title", DEFAULT_TITLE))
            .setContentText(text)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setSilent(true)
            .setAutoCancel(true)
            .setTimeoutAfter(VISIBLE_MS);
        if (launch != null) {
            builder.setContentIntent(PendingIntent.getActivity(context, NOTIFICATION_ID, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        }
        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
            // Notifications not allowed (Android 13+); nothing can be shown.
        }
    }

    private static int color(JSONObject style, String key, String fallback) {
        try {
            return Color.parseColor(style.optString(key, fallback));
        } catch (IllegalArgumentException e) {
            return Color.parseColor(fallback);
        }
    }

    private static int statusBarHeight(Context context) {
        int id = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        return id > 0 ? context.getResources().getDimensionPixelSize(id) : dp(context, 24);
    }

    private static int dp(Context context, float value) {
        return Math.round(value * context.getResources().getDisplayMetrics().density);
    }
}
