// @version 1549
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
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import android.media.RingtoneManager;
import android.media.Ringtone;
import android.media.AudioAttributes;
import android.database.Cursor;
import org.json.JSONArray;
import org.json.JSONObject;
public class LauncherActivity
extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    private static final int LOCAL_NOTIF_PORT = 8765;
    private Ringtone _previewRingtone = null;
    private ServerSocket _localServer = null;
    private Thread _localServerThread = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        Intent intent = getIntent();
        Uri data = intent != null ? intent.getData() : null;
        if (data != null && "appsettings".equals(data.getScheme())) {
            Intent settingsIntent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            settingsIntent.setData(Uri.parse("package:io.github.evorulz.twa"));
            settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(settingsIntent);
        }
        if (data != null && "myfiles".equals(data.getScheme())) {
            Intent myFilesIntent = new Intent(Intent.ACTION_VIEW);
            myFilesIntent.setPackage("com.sec.android.app.myfiles");
            myFilesIntent.setData(data);
            myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { startActivity(myFilesIntent); } catch (Exception ignored) {}
            return;
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
        public void openMyFiles() {
            Intent myFilesIntent = new Intent(android.app.DownloadManager.ACTION_VIEW_DOWNLOADS);
            myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { startActivity(myFilesIntent); } catch (Exception ignored) {}
        }
        @JavascriptInterface
        public void setStatusBarIconColor(boolean lightIcons) {
            runOnUiThread(() -> {
                WindowInsetsControllerCompat wic = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
                if (wic != null) wic.setAppearanceLightStatusBars(!lightIcons);
            });
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
        public void setNotifEnabled(boolean enabled) {
            getSharedPreferences("notif", Context.MODE_PRIVATE)
                .edit().putBoolean("notifEnabled", enabled).apply();
        }
        @JavascriptInterface
        public String getNextFireTime() {
            return String.valueOf(getSharedPreferences("notif", Context.MODE_PRIVATE)
                .getLong("nextFireMs", 0));
        }
        @JavascriptInterface
        public void scheduleRepeatingNotification(long intervalMs) {
            AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
            Intent i = new Intent(LauncherActivity.this, NotificationReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(LauncherActivity.this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.cancel(pi);
            if (intervalMs > 0) {
                long _nextFire = System.currentTimeMillis() + intervalMs;
                LauncherActivity.this.getSharedPreferences("notif", Context.MODE_PRIVATE)
                    .edit().putLong("intervalMs", intervalMs).putLong("nextFireMs", _nextFire).apply();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire, pi);
                } else {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire, pi);
                }
            } else {
                LauncherActivity.this.getSharedPreferences("notif", Context.MODE_PRIVATE)
                    .edit().putLong("nextFireMs", 0).apply();
            }
        }
        @JavascriptInterface
        public void markHabitDone(String dateKey, boolean done) {
            getSharedPreferences("notif", Context.MODE_PRIVATE)
            .edit().putBoolean("done_" + dateKey, done).apply();
        }
        @JavascriptInterface
        public String getNotifSoundList() {
            try {
                RingtoneManager rm = new RingtoneManager(LauncherActivity.this);
                rm.setType(RingtoneManager.TYPE_NOTIFICATION);
                Cursor cursor = rm.getCursor();
                JSONArray arr = new JSONArray();
                JSONObject none = new JSONObject();
                none.put("name", "None");
                none.put("uri", "");
                arr.put(none);
                while (cursor.moveToNext()) {
                    String sName = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
                    Uri sUri = rm.getRingtoneUri(cursor.getPosition());
                    JSONObject obj = new JSONObject();
                    obj.put("name", sName);
                    obj.put("uri", sUri.toString());
                    arr.put(obj);
                }
                return arr.toString();
            } catch (Exception e) { return "[]"; }
        }
        @JavascriptInterface
        public void previewNotifSound(String uriStr) {
            try {
                if (_previewRingtone != null) { _previewRingtone.stop(); _previewRingtone = null; }
                if (uriStr == null || uriStr.isEmpty()) return;
                _previewRingtone = RingtoneManager.getRingtone(LauncherActivity.this, Uri.parse(uriStr));
                if (_previewRingtone != null) _previewRingtone.play();
            } catch (Exception e) {}
        }
        @JavascriptInterface
        public void stopNotifSoundPreview() {
            try {
                if (_previewRingtone != null) { _previewRingtone.stop(); _previewRingtone = null; }
            } catch (Exception e) {}
        }
        @JavascriptInterface
        public void setNotifSound(String uriStr, String name) {
            try {
                if (_previewRingtone != null) { _previewRingtone.stop(); _previewRingtone = null; }
                String _uri = uriStr == null ? "" : uriStr;
                String _name = name == null ? "Default" : name;
                getSharedPreferences("notif", Context.MODE_PRIVATE).edit()
                    .putString("soundUri", _uri).putString("soundName", _name).apply();
                _createNotifChannel(_uri);
            } catch (Exception e) {}
        }
        @JavascriptInterface
        public String getNotifSound() {
            try {
                JSONObject obj = new JSONObject();
                obj.put("uri", getSharedPreferences("notif", Context.MODE_PRIVATE).getString("soundUri", ""));
                obj.put("name", getSharedPreferences("notif", Context.MODE_PRIVATE).getString("soundName", "Default"));
                return obj.toString();
            } catch (Exception e) { return "{\"uri\":\"\",\"name\":\"Default\"}"; }
        }
        @JavascriptInterface
        public void setStartOffset(long offsetMs) {
            getSharedPreferences("notif", Context.MODE_PRIVATE)
                .edit().putLong("startOffsetMs", offsetMs).apply();
        }
        @JavascriptInterface
        public void showNotification(String title, String body) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            String _chId = _getChannelId();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (nm.getNotificationChannel(_chId) == null) {
                    NotificationChannel ch = new NotificationChannel(_chId, "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
                    nm.createNotificationChannel(ch);
                }
            }
            Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent launchPi = PendingIntent.getActivity(LauncherActivity.this, 1, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            NotificationCompat.Builder _nb = new NotificationCompat.Builder(LauncherActivity.this, _chId)
                .setSmallIcon(R.drawable.ic_notification_icon)
                .setContentTitle(title)
                .setContentText(body)
                .setContentIntent(launchPi)
                .setAutoCancel(true);
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                String _su = getSharedPreferences("notif", Context.MODE_PRIVATE).getString("soundUri", null);
                if (_su != null && !_su.isEmpty()) _nb.setSound(Uri.parse(_su));
            }
            nm.notify((int) System.currentTimeMillis(), _nb.build());
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
            if (savedInterval == 0) {
                savedInterval = 60 * 60 * 1000L;
                getSharedPreferences("notif", Context.MODE_PRIVATE)
                .edit().putLong("intervalMs", savedInterval).apply();
            }
            if (pi == null) {
                PendingIntent newPi = PendingIntent.getBroadcast(this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                long _nextFireOnStart = System.currentTimeMillis() + savedInterval;
                getSharedPreferences("notif", Context.MODE_PRIVATE).edit().putLong("nextFireMs", _nextFireOnStart).apply();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFireOnStart, newPi);
                } else {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFireOnStart, newPi);
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
        startLocalServer();
    }
    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopLocalServer();
        if (_previewRingtone != null) {
            try { _previewRingtone.stop(); } catch (Exception e) {}
            _previewRingtone = null;
        }
    }
    private String _getChannelId() {
        return getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getString("channelId", "habit_reminders");
    }
    private void _createNotifChannel(String uriStr) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager _nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        _nm.deleteNotificationChannel(_getChannelId());
        int _ver = getSharedPreferences("notif", Context.MODE_PRIVATE).getInt("channelVer", 0) + 1;
        String _newId = "habit_v" + _ver;
        getSharedPreferences("notif", Context.MODE_PRIVATE).edit()
            .putInt("channelVer", _ver).putString("channelId", _newId).apply();
        NotificationChannel _ch = new NotificationChannel(
            _newId, "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
        if (uriStr != null && !uriStr.isEmpty()) {
            AudioAttributes _attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            _ch.setSound(Uri.parse(uriStr), _attrs);
        } else {
            _ch.setSound(null, null);
        }
        _nm.createNotificationChannel(_ch);
    }
    private void startLocalServer() {
        if (_localServerThread != null && _localServerThread.isAlive()) return;
        _localServerThread = new Thread(() -> {
            try {
                _localServer = new ServerSocket(LOCAL_NOTIF_PORT);
                while (!Thread.currentThread().isInterrupted() && _localServer != null && !_localServer.isClosed()) {
                    try {
                        Socket client = _localServer.accept();
                        new Thread(() -> handleLocalRequest(client)).start();
                    } catch (Exception e) {
                        if (_localServer == null || _localServer.isClosed()) break;
                    }
                }
            } catch (Exception e) {}
        });
        _localServerThread.setDaemon(true);
        _localServerThread.start();
    }
    private void stopLocalServer() {
        try {
            if (_localServer != null && !_localServer.isClosed()) _localServer.close();
        } catch (Exception e) {}
        if (_localServerThread != null) { _localServerThread.interrupt(); _localServerThread = null; }
        _localServer = null;
    }
    private void handleLocalRequest(Socket client) {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(client.getInputStream()));
            String requestLine = reader.readLine();
            String origin = "https://evorulz.github.io";
            String h;
            while ((h = reader.readLine()) != null && !h.isEmpty()) {
                if (h.startsWith("Origin: ")) origin = h.substring(8).trim();
            }
            boolean isOptions = requestLine != null && requestLine.startsWith("OPTIONS ");
        String responseBody = "ok";
        if (!isOptions && requestLine != null && requestLine.startsWith("GET ")) {
                String path = requestLine.split(" ")[1];
                String[] parts = path.split("\\?", 2);
                String endpoint = parts[0];
                String query = parts.length > 1 ? parts[1] : "";
                Map<String, String> params = new HashMap<>();
                for (String pair : query.split("&")) {
                    String[] kv = pair.split("=", 2);
                    if (kv.length == 2) {
                        try { params.put(kv[0], URLDecoder.decode(kv[1], "UTF-8")); } catch (Exception ignored) {}
                    }
                }
                if ("/schedule".equals(endpoint)) {
                    long ivMs = 0;
                    try { ivMs = Long.parseLong(params.containsKey("interval") ? params.get("interval") : "0"); } catch (Exception ignored) {}
                    boolean en = !"0".equals(params.containsKey("enabled") ? params.get("enabled") : "1");
                    final long fIv = ivMs;
                    final boolean fEn = en;
                    runOnUiThread(() -> {
                        AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
                        Intent i = new Intent(LauncherActivity.this, NotificationReceiver.class);
                        PendingIntent pi = PendingIntent.getBroadcast(LauncherActivity.this, 0, i,
                            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                        am.cancel(pi);
                        long _nextFire2 = fIv > 0 && fEn ? System.currentTimeMillis() + fIv : 0;
                        getSharedPreferences("notif", MODE_PRIVATE).edit()
                            .putLong("intervalMs", fIv).putBoolean("notifEnabled", fEn)
                            .putLong("nextFireMs", _nextFire2).apply();
                        if (fIv > 0 && fEn) {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire2, pi);
                            } else {
                                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire2, pi);
                            }
                        }
                    });
                } else if ("/markdone".equals(endpoint)) {
                String date = params.containsKey("date") ? params.get("date") : "";
                boolean done = "1".equals(params.containsKey("done") ? params.get("done") : "0");
                if (!date.isEmpty()) {
                    getSharedPreferences("notif", MODE_PRIVATE).edit().putBoolean("done_" + date, done).apply();
                }
            } else if ("/sounds".equals(endpoint)) {
                try {
                    RingtoneManager rm = new RingtoneManager(LauncherActivity.this);
                    rm.setType(RingtoneManager.TYPE_NOTIFICATION);
                    Cursor cursor = rm.getCursor();
                    JSONArray arr = new JSONArray();
                    JSONObject noneObj = new JSONObject();
                    noneObj.put("name", "None");
                    noneObj.put("uri", "");
                    arr.put(noneObj);
                    while (cursor.moveToNext()) {
                        String sName = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
                        Uri sUri = rm.getRingtoneUri(cursor.getPosition());
                        JSONObject obj = new JSONObject();
                        obj.put("name", sName);
                        obj.put("uri", sUri.toString());
                        arr.put(obj);
                    }
                    responseBody = arr.toString();
                } catch (Exception e) { responseBody = "[]"; }
            } else if ("/currentsound".equals(endpoint)) {
                try {
                    JSONObject obj = new JSONObject();
                    obj.put("uri", getSharedPreferences("notif", MODE_PRIVATE).getString("soundUri", ""));
                    obj.put("name", getSharedPreferences("notif", MODE_PRIVATE).getString("soundName", "Default"));
                    responseBody = obj.toString();
                } catch (Exception e) { responseBody = "{\"uri\":\"\",\"name\":\"Default\"}"; }
            } else if ("/nextfiretime".equals(endpoint)) {
                responseBody = String.valueOf(
                    getSharedPreferences("notif", MODE_PRIVATE).getLong("nextFireMs", 0));
            } else if ("/setsound".equals(endpoint)) {
                final String _sUri = params.containsKey("uri") ? params.get("uri") : "";
                final String _sName = params.containsKey("name") ? params.get("name") : "Default";
                runOnUiThread(() -> {
                    try {
                        if (_previewRingtone != null) { _previewRingtone.stop(); _previewRingtone = null; }
                        getSharedPreferences("notif", Context.MODE_PRIVATE).edit()
                            .putString("soundUri", _sUri).putString("soundName", _sName).apply();
                        _createNotifChannel(_sUri);
                    } catch (Exception e) {}
                });
            } else if ("/previewsound".equals(endpoint)) {
                final String _pUri = params.containsKey("uri") ? params.get("uri") : "";
                runOnUiThread(() -> {
                    try {
                        if (_previewRingtone != null) { _previewRingtone.stop(); _previewRingtone = null; }
                        if (!_pUri.isEmpty()) {
                            _previewRingtone = RingtoneManager.getRingtone(LauncherActivity.this, Uri.parse(_pUri));
                            if (_previewRingtone != null) _previewRingtone.play();
                        }
                    } catch (Exception e) {}
                });
            } else if ("/stoppreview".equals(endpoint)) {
                runOnUiThread(() -> {
                    try {
                        if (_previewRingtone != null) { _previewRingtone.stop(); _previewRingtone = null; }
                    } catch (Exception e) {}
                });
            } else if ("/setstartoffset".equals(endpoint)) {
                long _offsetMs = 0;
                try { _offsetMs = Long.parseLong(params.containsKey("offset") ? params.get("offset") : "0"); }
                catch (Exception ignored) {}
                final long _fOffsetMs = _offsetMs;
                runOnUiThread(() -> {
                    getSharedPreferences("notif", MODE_PRIVATE)
                        .edit().putLong("startOffsetMs", _fOffsetMs).apply();
                });
            }
        }
        String corsHdrs = "Access-Control-Allow-Origin: " + origin + "\r\n" +
            "Access-Control-Allow-Methods: GET, OPTIONS\r\n" +
            "Access-Control-Allow-Private-Network: true\r\n";
        byte[] bodyBytes = isOptions ? new byte[0] : responseBody.getBytes("UTF-8");
        String response = "HTTP/1.1 200 OK\r\n" + corsHdrs +
            "Content-Type: application/json\r\nContent-Length: " + bodyBytes.length + "\r\nConnection: close\r\n\r\n";
        OutputStream out = client.getOutputStream();
        out.write(response.getBytes("UTF-8"));
        if (!isOptions) out.write(bodyBytes);
        out.flush();
        client.close();
        } catch (Exception e) {
            try { client.close(); } catch (Exception ignored) {}
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
        if (data != null && "habitnotify".equals(data.getScheme()) && "myfiles".equals(data.getHost())) {
            Intent myFilesIntent = new Intent(android.app.DownloadManager.ACTION_VIEW_DOWNLOADS);
            myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { startActivity(myFilesIntent); } catch (Exception ignored) {}
        }
        if (data != null && "myfiles".equals(data.getScheme())) {
            Intent myFilesIntent = new Intent(Intent.ACTION_VIEW);
            myFilesIntent.setPackage("com.sec.android.app.myfiles");
            myFilesIntent.setData(data);
            myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { startActivity(myFilesIntent); } catch (Exception ignored) {}
            return;
        }
        if (data != null && "habitnotify".equals(data.getScheme())) {
            String host = data.getHost();
            if ("schedule".equals(host)) {
                String intervalStr = data.getQueryParameter("interval");
                long intervalMs = 0;
                try { intervalMs = Long.parseLong(intervalStr); } catch (Exception ignored) {}
                AlarmManager am = (AlarmManager) getSystemService(ALARM_SERVICE);
                Intent alarmIntent = new Intent(this, NotificationReceiver.class);
                PendingIntent pi = PendingIntent.getBroadcast(this, 0, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                am.cancel(pi);
                getSharedPreferences("notif", Context.MODE_PRIVATE)
                .edit().putLong("intervalMs", intervalMs).apply();
                if (intervalMs > 0) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + intervalMs, pi);
                    } else {
                        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + intervalMs, pi);
                    }
                }
                return;
            } else if ("notify".equals(host)) {
                String title = data.getQueryParameter("title");
                String body = data.getQueryParameter("body");
                if (title == null) title = "Habit Tracker";
                if (body == null) body = "Reminder";
                NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    NotificationChannel ch = new NotificationChannel("habit_reminders", "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
                    nm.createNotificationChannel(ch);
                }
                Intent launchIntent2 = getPackageManager().getLaunchIntentForPackage(getPackageName());
                PendingIntent launchPi2 = PendingIntent.getActivity(this, 1, launchIntent2, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                Notification n = new NotificationCompat.Builder(this, "habit_reminders")
                .setSmallIcon(R.drawable.ic_notification_icon)
                .setContentTitle(title)
                .setContentText(body)
                .setContentIntent(launchPi2)
                .setAutoCancel(true)
                .build();
                nm.notify((int) System.currentTimeMillis(), n);
                return;
            } else if ("myfiles".equals(host)) {
                Intent myFilesIntent = new Intent(android.app.DownloadManager.ACTION_VIEW_DOWNLOADS);
                myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                try { startActivity(myFilesIntent); } catch (Exception ignored) {}
                return;
            } else if ("alarmsettings".equals(host)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    Intent i2 = new Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    i2.setData(Uri.parse("package:io.github.evorulz.twa"));
                    i2.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i2);
                } else {
                    Intent i2 = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    i2.setData(Uri.parse("package:io.github.evorulz.twa"));
                    i2.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i2);
                }
                return;
            } else if ("markdone".equals(host)) {
                String dateParam = data.getQueryParameter("date");
                String doneParam = data.getQueryParameter("done");
                if (dateParam != null && doneParam != null) {
                    boolean isDone = "1".equals(doneParam);
                    getSharedPreferences("notif", Context.MODE_PRIVATE).edit().putBoolean("done_" + dateParam, isDone).apply();
                }
                return;
            }
            return;
        }
    }
    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }
    @Override
    protected Uri getLaunchingUrl() {
        Uri uri = super.getLaunchingUrl();
        return uri;
    }
}

