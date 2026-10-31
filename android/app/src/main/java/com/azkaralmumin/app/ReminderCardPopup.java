package com.azkaralmumin.app;

import android.app.KeyguardManager;
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

import org.json.JSONObject;

/**
 * The morning / evening adhkar reminder as the app's own floating card, drawn
 * over whatever is on screen (home screen or any app), like the card the app
 * shows while it is open. Needs "Display over other apps"; without it, or on
 * the lock screen, the reminder notification alone is shown. "Read now" opens
 * the adhkar page; the card goes away on ✕ or after VISIBLE_MS.
 */
final class ReminderCardPopup {
    static final long VISIBLE_MS = 30_000;
    private static final int HEADS_UP_CLEARANCE_DP = 124;
    private static final long FADE_MS = 250;
    private static View current;

    private ReminderCardPopup() {}

    /** Main thread. {@code done} runs once the card is up (or nothing was shown). */
    static void show(Context context, JSONObject item, Runnable done) {
        PowerManager power = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        KeyguardManager keyguard = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
        boolean screenOn = power == null || power.isInteractive();
        boolean locked = keyguard != null && keyguard.isKeyguardLocked();
        // While the app is open its own card shows this reminder.
        if (!screenOn || locked || MainActivity.isInForeground() || !Settings.canDrawOverlays(context)) {
            done.run();
            return;
        }
        WindowManager windows = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        if (windows == null) {
            done.run();
            return;
        }
        dismissCurrent(windows);
        View card = buildCard(context, item, windows);
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            Build.VERSION.SDK_INT >= 26
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
        // The reminder notification pops up at the top at the same minute (heads-up,
        // up to ~110dp with two lines). Sit below it so it never covers the card.
        params.y = statusBarHeight(context) + dp(context, HEADS_UP_CLEARANCE_DP);
        params.setTitle("AdhkarReminderCard");
        try {
            windows.addView(card, params);
        } catch (RuntimeException e) {
            done.run();
            return;
        }
        current = card;
        card.setAlpha(0f);
        card.setTranslationY(-dp(context, 24));
        card.animate().alpha(1f).translationY(0f).setDuration(FADE_MS).start();
        new Handler(Looper.getMainLooper()).postDelayed(() -> remove(windows, card), VISIBLE_MS);
        // A visible overlay keeps the process alive; the broadcast can end now.
        done.run();
    }

    private static void dismissCurrent(WindowManager windows) {
        if (current != null) {
            try {
                windows.removeView(current);
            } catch (RuntimeException ignored) {
                // Already gone.
            }
            current = null;
        }
    }

    private static void remove(WindowManager windows, View card) {
        if (card.getParent() == null) return;
        card.animate().alpha(0f).setDuration(FADE_MS).withEndAction(() -> {
            try {
                windows.removeView(card);
            } catch (RuntimeException ignored) {
                // Already gone.
            }
            if (current == card) current = null;
        }).start();
    }

    /** Mirrors the in-app reminder card (PrayerNotificationManager.tsx). */
    private static View buildCard(Context context, JSONObject item, WindowManager windows) {
        boolean morning = !"evening".equals(item.optString("kind"));
        int textColor = morning ? 0xFF020617 : Color.WHITE;

        LinearLayout outer = new LinearLayout(context);
        outer.setPadding(dp(context, 12), 0, dp(context, 12), 0);

        LinearLayout card = new LinearLayout(context);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        card.setPadding(dp(context, 14), dp(context, 14), dp(context, 14), dp(context, 14));
        card.setElevation(dp(context, 12));
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.RIGHT_LEFT,
            morning ? new int[]{0xFFF59E0B, 0xFFFBBF24, 0xFFF97316} : new int[]{0xFF4338CA, 0xFF7E22CE, 0xFF312E81});
        bg.setCornerRadius(dp(context, 18));
        bg.setStroke(dp(context, 2), morning ? 0xFFFEF3C7 : 0xCCA5B4FC);
        card.setBackground(bg);
        outer.addView(card, new LinearLayout.LayoutParams(-1, -2));

        // Icon tile.
        TextView icon = new TextView(context);
        icon.setText(morning ? "🌅" : "🌙");
        icon.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
        icon.setGravity(Gravity.CENTER);
        GradientDrawable tile = new GradientDrawable();
        tile.setCornerRadius(dp(context, 16));
        tile.setColor(morning ? Color.WHITE : 0x33FFFFFF);
        icon.setBackground(tile);
        card.addView(icon, new LinearLayout.LayoutParams(dp(context, 48), dp(context, 48)));

        // Title and text.
        LinearLayout texts = new LinearLayout(context);
        texts.setOrientation(LinearLayout.VERTICAL);
        texts.setPadding(dp(context, 12), 0, dp(context, 8), 0);
        TextView title = new TextView(context);
        title.setText(item.optString("title"));
        title.setTextColor(textColor);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setSingleLine(true);
        title.setEllipsize(TextUtils.TruncateAt.END);
        texts.addView(title);
        TextView body = new TextView(context);
        body.setText(item.optString("body"));
        body.setTextColor(morning ? 0xCC020617 : 0xE6FFFFFF);
        body.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        body.setMaxLines(2);
        body.setEllipsize(TextUtils.TruncateAt.END);
        texts.addView(body);
        card.addView(texts, new LinearLayout.LayoutParams(0, -2, 1f));

        // "Read now".
        TextView read = new TextView(context);
        read.setText("اقرأ الآن ←");
        read.setTextColor(morning ? Color.WHITE : 0xFF020617);
        read.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        read.setTypeface(Typeface.DEFAULT_BOLD);
        read.setGravity(Gravity.CENTER);
        read.setPadding(dp(context, 12), dp(context, 9), dp(context, 12), dp(context, 9));
        GradientDrawable readBg = new GradientDrawable();
        readBg.setCornerRadius(dp(context, 12));
        readBg.setColor(morning ? 0xFF020617 : Color.WHITE);
        read.setBackground(readBg);
        read.setContentDescription("اقرأ الآن");
        card.addView(read, new LinearLayout.LayoutParams(-2, -2));

        // Close.
        TextView close = new TextView(context);
        close.setText("✕");
        close.setTextColor(textColor);
        close.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        close.setTypeface(Typeface.DEFAULT_BOLD);
        close.setGravity(Gravity.CENTER);
        close.setContentDescription("إغلاق");
        LinearLayout.LayoutParams closeParams = new LinearLayout.LayoutParams(dp(context, 36), dp(context, 36));
        closeParams.setMarginStart(dp(context, 6));
        card.addView(close, closeParams);

        final String route = item.optString("route", "/");
        read.setOnClickListener(v -> {
            remove(windows, outer);
            Intent open = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP)
                .putExtra(MainActivity.EXTRA_ROUTE, route);
            try {
                context.startActivity(open);
            } catch (RuntimeException ignored) {
                // Starting from the background was refused; the notification still opens it.
            }
        });
        close.setOnClickListener(v -> remove(windows, outer));
        return outer;
    }

    private static int statusBarHeight(Context context) {
        int id = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        return id > 0 ? context.getResources().getDimensionPixelSize(id) : dp(context, 24);
    }

    private static int dp(Context context, float value) {
        return Math.round(value * context.getResources().getDisplayMetrics().density);
    }
}
