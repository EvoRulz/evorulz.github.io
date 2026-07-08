// @version 1593
package io.github.evorulz.twa;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
public class MidnightAdjustReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        SharedPreferences prefs = context.getSharedPreferences("notif", Context.MODE_PRIVATE);
        java.util.Calendar today = java.util.Calendar.getInstance();
        String todayKey = String.format("%d-%02d-%02d",
            today.get(java.util.Calendar.YEAR),
            today.get(java.util.Calendar.MONTH) + 1,
            today.get(java.util.Calendar.DAY_OF_MONTH));
        java.util.Set<String> habitIds = prefs.getStringSet("habitIds", new java.util.HashSet<>());
        for (String habitId : habitIds) {
            boolean enabled = prefs.getBoolean("habitAutoTargetEnabled_" + habitId, false);
            if (!enabled) continue;
            String lastApplied = prefs.getString("habitAutoTargetLastApplied_" + habitId, "");
            if (todayKey.equals(lastApplied)) continue;
            int step = prefs.getInt("habitAutoTargetStep_" + habitId, 0);
            int cap = prefs.getInt("habitAutoTargetCap_" + habitId, 0);
            int current = prefs.getInt("habitThreshold_" + habitId, 0);
            if (step != 0) {
                boolean canApply = (step > 0 && current < cap) || (step < 0 && current > cap);
                if (canApply) {
                    int newVal = current + step;
                    if (step > 0) newVal = Math.min(newVal, cap);
                    if (step < 0) newVal = Math.max(newVal, cap);
                    prefs.edit().putInt("habitThreshold_" + habitId, newVal).apply();
                }
            }
            prefs.edit().putString("habitAutoTargetLastApplied_" + habitId, todayKey).apply();
        }
        scheduleNext(context);
    }
    static void scheduleNext(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent i = new Intent(context, MidnightAdjustReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(context, 2, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        java.util.Calendar next = java.util.Calendar.getInstance();
        next.set(java.util.Calendar.HOUR_OF_DAY, 0);
        next.set(java.util.Calendar.MINUTE, 0);
        next.set(java.util.Calendar.SECOND, 5);
        next.set(java.util.Calendar.MILLISECOND, 0);
        next.add(java.util.Calendar.DAY_OF_YEAR, 1);
        long nextMs = next.getTimeInMillis();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMs, pi);
        } else {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMs, pi);
        }
    }
    static void cancel(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent i = new Intent(context, MidnightAdjustReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(context, 2, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.cancel(pi);
    }
}

