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
import android.app.DownloadManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
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