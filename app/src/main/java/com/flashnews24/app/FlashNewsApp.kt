package com.flashnews24.app

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.google.firebase.FirebaseApp

class FlashNewsApp : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        try {
            FirebaseApp.initializeApp(this)
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic("breaking-news")
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        android.util.Log.d("FlashNewsApp", "Successfully subscribed to breaking-news topic")
                    } else {
                        android.util.Log.e("FlashNewsApp", "Failed to subscribe to breaking-news topic", task.exception)
                    }
                }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        
        // Initialize Mobile Ads SDK (AdMob)
        try {
            MobileAds.initialize(this) {}
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
