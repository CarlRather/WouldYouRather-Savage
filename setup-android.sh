
#!/usr/bin/env bash
set -e

mkdir -p app/src/main/assets
mkdir -p app/src/main/java/com/carlrather/wouldyourather

# Copy game files
cp index.html style.css script.js app/src/main/assets/

# Generate launcher icon sizes from the uploaded image
python3 -m pip install --quiet Pillow

python3 - <<'PY'
from PIL import Image
from pathlib import Path

source = Path("wyr-icon.png")
if not source.exists():
    raise SystemExit("ERROR: wyr-icon.png is missing from the repository root.")

image = Image.open(source).convert("RGBA")
image = image.resize((512, 512), Image.Resampling.LANCZOS)

sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, size in sizes.items():
    dest = Path("app/src/main/res") / folder
    dest.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.Resampling.LANCZOS).save(
        dest / "ic_launcher.png"
    )
PY

# Android project configuration
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
        versionCode 2
        versionName '1.1'
    }
}
EOF

cat > app/src/main/AndroidManifest.xml <<'EOF'
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:theme="@android:style/Theme.Material.NoActionBar"
        android:label="Would You Rather: Savage Edition"
        android:icon="@mipmap/ic_launcher"
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
