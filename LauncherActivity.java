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
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import java.io.File;
public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        Uri data = intent.getData();
        // Intercept myfiles:// URLs and launch Samsung My Files natively
        if (data != null && "myfiles".equals(data.getScheme())) {
            if ("downloads".equals(data.getHost())) {
                // Try to open My Files directly to the Downloads folder.
                // FLAG_ACTIVITY_CLEAR_TASK forces a fresh start so path extras are respected.
                try {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(
                            Environment.DIRECTORY_DOWNLOADS);
                    String downloadsPath = downloadsDir.getAbsolutePath();

                    Intent myFilesIntent = new Intent(Intent.ACTION_MAIN);
                    myFilesIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                    myFilesIntent.setComponent(new ComponentName(
                            "com.sec.android.app.myfiles",
                            "com.sec.android.app.myfiles.external.ui.MainActivity"));
                    myFilesIntent.putExtra("current_path", downloadsPath);
                    myFilesIntent.putExtra("path",         downloadsPath);
                    myFilesIntent.putExtra("rootName",     "Downloads");
                    myFilesIntent.addFlags(
                            Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(myFilesIntent);
                    return;
                } catch (Exception e) {
                    // Fall through to plain open below
                }
            }

            // Plain open (no folder targeting, or fallback if Downloads targeting failed)
            try {
                Intent myFilesIntent = new Intent(Intent.ACTION_MAIN);
                myFilesIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                myFilesIntent.setComponent(new ComponentName(
                        "com.sec.android.app.myfiles",
                        "com.sec.android.app.myfiles.external.ui.MainActivity"));
                myFilesIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(myFilesIntent);
            } catch (Exception e) {
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