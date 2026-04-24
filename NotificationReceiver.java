package io.github.evorulz.twa;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class NotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel("habit_reminders", "Habit Reminders", NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
        }
        Notification n = new NotificationCompat.Builder(context, "habit_reminders")
            .setSmallIcon(R.drawable.ic_notification_icon)
            .setContentTitle("Habit Tracker")
            .setContentText("Pushups not done yet today.")
            .setAutoCancel(true)
            .build();
        nm.notify(1002, n);
    }
}