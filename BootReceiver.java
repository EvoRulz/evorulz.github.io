// @version 1581
package io.github.evorulz.twa;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
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

