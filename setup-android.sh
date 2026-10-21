
#!/usr/bin/env bash
set -e

mkdir -p app/src/main/assets
mkdir -p app/src/main/java/com/carlrather/wouldyourather

cp index.html style.css script.js app/src/main/assets/

cat > settings.gradle <<'EOF'
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "WouldYouRatherSavage"
include(":app")
EOF

cat > build.gradle <<'EOF'
plugins {
    id 'com.android.application' version '8.7.3' apply false
}
EOF

cat > app/build.gradle <<'EOF'
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.carlrather.wouldyourather'
    compileSdk 35

    defaultConfig {
        applicationId 'com.carlrather.wouldyourather'
        minSdk 23
        targetSdk 28
        versionCode 1
        versionName '1.0'
    }
}
EOF

cat > app/src/main/AndroidManifest.xml <<'EOF'
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:theme="@android:style/Theme.Material.NoActionBar"
        android:label="Would You Rather: Savage Edition"
        android:allowBackup="false">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

cat > app/src/main/java/com/carlrather/wouldyourather/MainActivity.java <<'EOF'
package com.carlrather.wouldyourather;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;

public class MainActivity extends Activity {
    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        WebView web = new WebView(this);
        web.setBackgroundColor(0xFF0B0712);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.setWebViewClient(new WebViewClient());
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }
}
EOF

echo "Android project files generated."
