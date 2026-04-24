/*
 * Copyright 2020 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.github.evorulz.twa;
import android.app.AlarmManager;
import android.content.Context;
import android.app.DownloadManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import androidx.core.app.NotificationCompat;
import android.webkit.WebView;
public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = getIntent();
        Uri data = intent != null ? intent.getData() : null;
        if (data != null && "appsettings".equals(data.getScheme())) {
            Intent settingsIntent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            settingsIntent.setData(Uri.parse("package:io.github.evorulz.twa"));
            settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(settingsIntent);
        }
    }

    public class SettingsBridge {
        @JavascriptInterface
        public String getPermissionStatus() {
            boolean notif = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                notif = checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED;
            }
            AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
            boolean alarm = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms();
            return "{\"notifications\":" + notif + ",\"exactAlarm\":" + alarm + "}";
        }
        @JavascriptInterface
        public void openAlarmSettings() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                Intent i = new Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                i.setData(Uri.parse("package:io.github.evorulz.twa"));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } else {
                Intent i = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                i.setData(Uri.parse("package:io.github.evorulz.twa"));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            }
        }
        @JavascriptInterface
        public void openAppSettings() {
            Intent i = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            i.setData(Uri.parse("package:io.github.evorulz.twa"));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        }
        @JavascriptInterface
        public void scheduleRepeatingNotification(long intervalMs) {
            AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
            Intent i = new Intent(LauncherActivity.this, NotificationReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(LauncherActivity.this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.cancel(pi);
            if (intervalMs > 0) {
                LauncherActivity.this.getSharedPreferences("notif", Context.MODE_PRIVATE)
                    .edit().putLong("intervalMs", intervalMs).apply();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + intervalMs, pi);
                } else {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + intervalMs, pi);
                }
            }
        }
        @JavascriptInterface
        public void showNotification(String title, String body) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel ch = new NotificationChannel("habit_reminders", "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
                nm.createNotificationChannel(ch);
            }
            Notification n = new NotificationCompat.Builder(LauncherActivity.this, "habit_reminders")
                .setSmallIcon(R.drawable.ic_notification_icon)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .build();
            nm.notify(1001, n);
        }
    }

    public class OrientationBridge {
        @JavascriptInterface
        public void lock(String orientation) {
            if (orientation.equals("portrait")) {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            } else if (orientation.equals("landscape")) {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            } else {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR);
            }
        }
    }

    @Override
    protected void onStart() {
        long savedInterval = getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getLong("intervalMs", 0);
        if (savedInterval > 0) {
            AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
            Intent i = new Intent(this, NotificationReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(this, 0, i, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (pi == null) {
                PendingIntent newPi = PendingIntent.getBroadcast(this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + savedInterval, newPi);
                } else {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + savedInterval, newPi);
                }
            }
        }
        super.onStart();
        android.view.View root = getWindow().getDecorView().getRootView();
        WebView wv = findWebView(root);
        if (wv != null) {
            wv.addJavascriptInterface(new OrientationBridge(), "AndroidOrientation");
            wv.addJavascriptInterface(new SettingsBridge(), "AndroidSettings");
        }
    }

    private WebView findWebView(android.view.View v) {
        if (v instanceof WebView) return (WebView) v;
        if (v instanceof android.view.ViewGroup) {
            android.view.ViewGroup vg = (android.view.ViewGroup) v;
            for (int i = 0; i < vg.getChildCount(); i++) {
                WebView found = findWebView(vg.getChildAt(i));
                if (found != null) return found;
            }
        }
        return null;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        Uri data = intent.getData();
        if (data != null && "appsettings".equals(data.getScheme())) {
    Intent settingsIntent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                settingsIntent.setData(Uri.parse("package:io.github.evorulz.twa"));
                settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(settingsIntent);
    return;
    }

    if (data != null && "habitnotify".equals(data.getScheme())) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel ch = new NotificationChannel("habit_reminders", "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
                nm.createNotificationChannel(ch);
            }
            Notification n = new NotificationCompat.Builder(this, "habit_reminders")
                .setSmallIcon(R.drawable.ic_notification_icon)
                .setContentTitle("Habit Tracker")
                .setContentText("Pushups not done yet today.")
                .setAutoCancel(true)
                .build();
            nm.notify((int) System.currentTimeMillis(), n);
            return;
        }
        // Intercept myfiles:// URLs and launch Samsung My Files natively
        if (data != null && "myfiles".equals(data.getScheme())) {
            if ("downloads".equals(data.getHost())) {
                try {
                    Intent dlIntent = new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS);
                    dlIntent.setComponent(new ComponentName(
                            "com.sec.android.app.myfiles",
                            "com.sec.android.app.myfiles.external.ui.MainActivity"));
                    dlIntent.addFlags(
                            Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(dlIntent);
                    return;
                } catch (Exception ignored) {
                    // Fall through to plain open
                }
            }

            try {
                Intent myFilesIntent = new Intent(Intent.ACTION_MAIN);
                myFilesIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                myFilesIntent.setComponent(new ComponentName(
                        "com.sec.android.app.myfiles",
                        "com.sec.android.app.myfiles.external.ui.MainActivity"));
                myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(myFilesIntent);
            } catch (Exception ignored) {
                // My Files not available on this device
            }
            return;
        }
        super.onNewIntent(intent);
    }

    @Override
    protected Uri getLaunchingUrl() {
        Uri uri = super.getLaunchingUrl();
        return uri;
    }
}