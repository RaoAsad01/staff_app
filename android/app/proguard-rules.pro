# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Expo
-keep class expo.** { *; }
-keep class com.expo.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep React Native bridge
-keep class com.facebook.react.bridge.** { *; }

# Keep your app's main classes
-keep class com.asad_ahmad.staffapp.** { *; }

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}