// @version 1598
package io.github.evorulz.twa;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import androidx.core.app.NotificationCompat;
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        NotificationManager _bootNm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        String _bootChId = "boot_status_channel";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (_bootNm.getNotificationChannel(_bootChId) == null) {
                NotificationChannel _bootCh = new NotificationChannel(
                    _bootChId, "App Status", NotificationManager.IMPORTANCE_LOW);
                _bootNm.createNotificationChannel(_bootCh);
            }
        }
        Intent _bootLaunchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent _bootLaunchPi = PendingIntent.getActivity(context, 2, _bootLaunchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification _bootNotif = new NotificationCompat.Builder(context, _bootChId)
            .setSmallIcon(R.drawable.ic_notification_icon)
            .setContentTitle("Habit Tracker")
            .setContentText("Notifications rescheduled after restart.")
            .setContentIntent(_bootLaunchPi)
            .setAutoCancel(true)
            .build();
        _bootNm.notify(999001, _bootNotif);
        boolean autoTargetEnabled = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getBoolean("autoTargetEnabled", false);
        if (autoTargetEnabled) MidnightAdjustReceiver.scheduleNext(context);
        boolean notifEnabled = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getBoolean("notifEnabled", true);
        if (!notifEnabled) return;
        java.util.Set<String> habitIds = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
            .getStringSet("habitIds", new java.util.HashSet<>());
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        for (String habitId : habitIds) {
            boolean habitEnabled = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
                .getBoolean("enabled_" + habitId, false);
            if (!habitEnabled) continue;
            long intervalMs = context.getSharedPreferences("notif", Context.MODE_PRIVATE)
                .getLong("interval_" + habitId, 0);
            if (intervalMs <= 0) continue;
            Intent i = new Intent(context, NotificationReceiver.class);
            i.putExtra("habitId", habitId);
            int reqCode = habitId.hashCode();
            PendingIntent pi = PendingIntent.getBroadcast(context, reqCode, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            // Fire almost immediately after boot instead of waiting a full interval. NotificationReceiver already
            // checks the start offset and the "done today" flag, so this only shows a notification if one is
            // actually due right now, otherwise it silently reschedules for the correct time.
            // NOTE: Doze mode battery restrictions beyond setAndAllowWhileIdle are not handled here.
            long _nextFire = System.currentTimeMillis() + 10000L;
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

