// @version 1583
package io.github.evorulz.twa;
import android.app.AlarmManager;
import android.os.Build;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import android.media.AudioAttributes;
import android.net.Uri;
public class NotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String habitId = intent.getStringExtra("habitId");
        if (habitId == null) return;
        boolean notifEnabled = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getBoolean("enabled_" + habitId, false);
        if (!notifEnabled) return;
        long _startOffsetMs = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getLong("startOffsetMs_" + habitId, 0);
        if (_startOffsetMs > 0) {
            java.util.Calendar _now = java.util.Calendar.getInstance();
            long _msFromMidnight = (_now.get(java.util.Calendar.HOUR_OF_DAY) * 3600L
                + _now.get(java.util.Calendar.MINUTE) * 60L
                + _now.get(java.util.Calendar.SECOND)) * 1000L;
            if (_msFromMidnight < _startOffsetMs) {
                java.util.Calendar _startToday = java.util.Calendar.getInstance();
                _startToday.set(java.util.Calendar.HOUR_OF_DAY, 0);
                _startToday.set(java.util.Calendar.MINUTE, 0);
                _startToday.set(java.util.Calendar.SECOND, 0);
                _startToday.set(java.util.Calendar.MILLISECOND, 0);
                long _nextFire = _startToday.getTimeInMillis() + _startOffsetMs;
                AlarmManager _am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                Intent _i = new Intent(context, NotificationReceiver.class);
                _i.putExtra("habitId", habitId);
                PendingIntent _pi = PendingIntent.getBroadcast(context, habitId.hashCode(), _i,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                context.getSharedPreferences("notif", Context.MODE_PRIVATE).edit()
                    .putLong("nextFire_" + habitId, _nextFire).apply();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !_am.canScheduleExactAlarms()) {
                    _am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire, _pi);
                } else {
                    _am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire, _pi);
                }
                return;
            }
        }
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        String _chId = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getString("channelId_" + habitId, "habit_reminders");
        String habitLabel = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getString("label_" + habitId, habitId);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (nm.getNotificationChannel(_chId) == null) {
                String _savedUri = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
                    .getString("soundUri_" + habitId, null);
                NotificationChannel ch = new NotificationChannel(
                    _chId, "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
                if (_savedUri != null && !_savedUri.isEmpty()) {
                    AudioAttributes attrs = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
                    ch.setSound(Uri.parse(_savedUri), attrs);
                }
                nm.createNotificationChannel(ch);
            }
        }
        java.util.Calendar cal = java.util.Calendar.getInstance();
        String todayKey = String.format("%d-%02d-%02d",
            cal.get(java.util.Calendar.YEAR),
            cal.get(java.util.Calendar.MONTH) + 1,
            cal.get(java.util.Calendar.DAY_OF_MONTH));
        boolean isDone = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getBoolean("done_" + habitId + "_" + todayKey, false);
        long intervalMs = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getLong("interval_" + habitId, 0);
        int reqCode = habitId.hashCode();
        if (isDone) {
            if (intervalMs > 0) {
                AlarmManager am2 = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                Intent i2 = new Intent(context, NotificationReceiver.class);
                i2.putExtra("habitId", habitId);
                PendingIntent pi2 = PendingIntent.getBroadcast(context, reqCode, i2,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                long _nextFire2 = System.currentTimeMillis() + intervalMs;
                context.getSharedPreferences("notif", Context.MODE_PRIVATE).edit()
                    .putLong("nextFire_" + habitId, _nextFire2).apply();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am2.canScheduleExactAlarms()) {
                    am2.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire2, pi2);
                } else {
                    am2.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire2, pi2);
                }
            }
            return;
        }
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent launchPi = PendingIntent.getActivity(context, 1, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder _nb = new NotificationCompat.Builder(context, _chId)
            .setSmallIcon(R.drawable.ic_notification_icon)
            .setContentTitle("Habit Tracker")
            .setContentText(habitLabel + " not done yet today.")
            .setContentIntent(launchPi)
            .setAutoCancel(true);
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            String _su = context.getSharedPreferences("notif", Context.MODE_PRIVATE).getString("soundUri", null);
            if (_su != null && !_su.isEmpty()) _nb.setSound(Uri.parse(_su));
        }
        nm.notify(habitId.hashCode(), _nb.build());
        if (intervalMs > 0) {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            Intent i = new Intent(context, NotificationReceiver.class);
            i.putExtra("habitId", habitId);
            PendingIntent pi = PendingIntent.getBroadcast(context, reqCode, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            long _nextFire = System.currentTimeMillis() + intervalMs;
            context.getSharedPreferences("notif", Context.MODE_PRIVATE).edit()
                .putLong("nextFire_" + habitId, _nextFire).apply();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire, pi);
            } else {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, _nextFire, pi);
            }
        }
    }
}

