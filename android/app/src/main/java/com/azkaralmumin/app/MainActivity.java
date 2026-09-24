package com.azkaralmumin.app;

import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.util.Objects;

public class MainActivity extends BridgeActivity {
    private final Handler startupHandler = new Handler(Looper.getMainLooper());
    private FrameLayout startupCover;
    private WebView startupWebView;
    private WebViewListener startupListener;
    private Runnable startupCheck;
    private boolean visualCheckPending;
    private int startupGeneration;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        if (Build.VERSION.SDK_INT >= 31) {
            androidx.core.splashscreen.SplashScreen.installSplashScreen(this);
        }
        super.onCreate(savedInstanceState);
        final Bridge bridge = getBridge();
        if (bridge == null) return;

        startupWebView = bridge.getWebView();
        // Allow layout inspection only in the isolated debug build.
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        startupWebView.setBackgroundColor(Color.rgb(5, 36, 24));
        startupWebView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // A transparent WebView can still submit a black compositor frame while
        // Chromium starts. Keep a real, opaque native sibling above it until a
        // verified HTML frame has drawn. The WebView remains VISIBLE and attached.
        startupCover = new FrameLayout(this);
        startupCover.setBackgroundResource(R.drawable.window_splash);
        startupCover.setClickable(true);
        startupCover.setContentDescription("جاري فتح أذكار المؤمن");
        addContentView(startupCover, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        final LinearLayout recovery = new LinearLayout(this);
        recovery.setOrientation(LinearLayout.VERTICAL);
        recovery.setGravity(Gravity.CENTER);
        recovery.setVisibility(View.GONE);
        final TextView message = new TextView(this);
        message.setText("استغرق فتح التطبيق وقتاً أطول من المعتاد. يمكنك الانتظار أو إعادة المحاولة.");
        message.setTextColor(Color.WHITE);
        message.setGravity(Gravity.CENTER);
        message.setTextSize(16);
        recovery.addView(message);
        final Button retry = new Button(this);
        retry.setText("إعادة المحاولة");
        recovery.addView(retry);
        final int margin = Math.round(24 * getResources().getDisplayMetrics().density);
        final FrameLayout.LayoutParams recoveryParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM);
        recoveryParams.setMargins(margin, margin, margin, margin);
        startupCover.addView(recovery, recoveryParams);

        // A failed renderer must leave a usable recovery action, never a frozen
        // logo. Retry is explicit and only reloads the page; stored data survives.
        final Runnable showRecovery = () -> {
            if (startupCover != null) recovery.setVisibility(View.VISIBLE);
        };
        startupCheck = this::checkStartupFrame;
        // Observe Capacitor's client without replacing its navigation, bridge,
        // error handling, or plugin callbacks.
        startupListener = new WebViewListener() {
            @Override
            public void onPageStarted(WebView webView) {
                if (startupCover == null) return;
                startupGeneration++;
                visualCheckPending = false;
                startupHandler.removeCallbacks(startupCheck);
                startupHandler.post(startupCheck);
            }

            @Override
            public void onPageCommitVisible(WebView webView, String url) {
                if (startupCover == null) return;
                startupHandler.removeCallbacks(startupCheck);
                startupHandler.post(startupCheck);
            }
        };
        bridge.addWebViewListener(startupListener);
        retry.setOnClickListener(view -> {
            startupGeneration++;
            visualCheckPending = false;
            startupHandler.removeCallbacksAndMessages(null);
            recovery.setVisibility(View.GONE);
            startupWebView.reload();
            startupHandler.post(startupCheck);
            startupHandler.postDelayed(showRecovery, 20000);
        });
        startupHandler.post(startupCheck);
        startupHandler.postDelayed(showRecovery, 20000);
    }

    private void checkStartupFrame() {
        if (startupCover == null || visualCheckPending || isFinishing()) return;
        final WebView webView = startupWebView;
        final String url = webView.getUrl();
        final Uri origin = Uri.parse(getBridge().getLocalUrl());
        final Uri current = url == null ? Uri.EMPTY : Uri.parse(url);
        // The initial commit can happen inside super.onCreate, before this
        // activity can register its listener. The local URL and DOM check below
        // prove that the actual app page has loaded without depending on that
        // event having been observed.
        if (!Objects.equals(origin.getScheme(), current.getScheme()) ||
            !Objects.equals(origin.getAuthority(), current.getAuthority()) ||
            !webView.isAttachedToWindow() || webView.getWidth() == 0 ||
            webView.getHeight() == 0 || webView.getContentHeight() == 0) {
            startupHandler.postDelayed(startupCheck, 100);
            return;
        }

        visualCheckPending = true;
        final int generation = startupGeneration;
        // about:blank may already have a nonzero height. Check the committed
        // local page and its decoded logo (or a rendered route/error) as well.
        webView.evaluateJavascript("(function(){var s=document.getElementById('boot-splash');" +
            "var i=s&&s.querySelector('img');var r=document.getElementById('root');" +
            "return !!((i&&i.complete&&i.naturalWidth>0)||(r&&r.innerText.trim()));})()", result -> {
            if (startupCover == null || generation != startupGeneration) return;
            if (!"true".equals(result)) {
                visualCheckPending = false;
                startupHandler.postDelayed(startupCheck, 100);
                return;
            }
            // API 23+: the verified DOM state is ready for the next draw. Keep
            // the native cover during that frame, then fade it out. Waiting for
            // an OnDrawListener here could stall forever when the opaque cover
            // occludes WebView drawing on some Android renderers.
            webView.postVisualStateCallback(generation, new WebView.VisualStateCallback() {
                @Override
                public void onComplete(long requestId) {
                    if (startupCover == null || generation != startupGeneration) return;
                    webView.invalidate();
                    webView.postOnAnimation(() -> revealWebView(generation));
                }
            });
        });
    }

    private void revealWebView(int generation) {
        if (startupCover == null || generation != startupGeneration) return;
        startupHandler.removeCallbacksAndMessages(null);
        getBridge().removeWebViewListener(startupListener);
        final FrameLayout cover = startupCover;
        startupCover = null;
        cover.animate().alpha(0f).setDuration(100).withEndAction(() -> {
            if (cover.getParent() instanceof ViewGroup) {
                ((ViewGroup) cover.getParent()).removeView(cover);
            }
        }).start();
    }

    @Override
    public void onDestroy() {
        startupGeneration++;
        startupCover = null;
        startupHandler.removeCallbacksAndMessages(null);
        if (getBridge() != null && startupListener != null) {
            getBridge().removeWebViewListener(startupListener);
        }
        super.onDestroy();
    }
}
