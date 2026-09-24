# ==========================================================================
#  أذكار المؤمن — R8 / ProGuard rules
#
#  Almost all of this app is JavaScript running in a WebView, so R8 only sees
#  the Capacitor shell. What it must not break is reflection: Capacitor finds
#  plugins and their @PluginMethod entry points by name at runtime, and the
#  JavaScript bridge calls them by that name. Anything renamed or stripped here
#  shows up as "plugin not implemented" at runtime, never as a build error.
# ==========================================================================

# --- Capacitor core and the plugin registry -------------------------------
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}
-keep public class * extends com.getcapacitor.Plugin { *; }

# Official plugins used by this app: App, Device, Filesystem, Haptics,
# Keyboard, LocalNotifications, Share, SplashScreen, StatusBar.
-keep class com.capacitorjs.plugins.** { *; }

# Cordova compatibility layer that Capacitor bridges through.
-keep class org.apache.cordova.** { *; }

# --- WebView bridge -------------------------------------------------------
# Methods exposed to JavaScript are invoked reflectively by name.
-keepclasseswithmembernames class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# --- Notification receivers ------------------------------------------------
# Referenced from AndroidManifest.xml by name; R8 cannot see those callers, and
# stripping them silently kills prayer reminders and post-reboot rescheduling.
-keep class com.capacitorjs.plugins.localnotifications.TimedNotificationPublisher { *; }
-keep class com.capacitorjs.plugins.localnotifications.NotificationDismissReceiver { *; }
-keep class com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver { *; }

# --- Diagnostics ----------------------------------------------------------
# Keep line numbers so a Play Console crash report is readable, but hide the
# original source file names.
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

# Strip debug logging from the release build.
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}
