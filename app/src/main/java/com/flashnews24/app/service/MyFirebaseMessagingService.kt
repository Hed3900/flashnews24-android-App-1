package com.flashnews24.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.flashnews24.app.MainActivity
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic("breaking-news")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Extract push notification details
        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "FlashNews24"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: "New article published!"
        
        val articleTitle = remoteMessage.data["article_title"] ?: remoteMessage.data["title"] ?: title
        val articleContent = remoteMessage.data["article_content"] ?: remoteMessage.data["content"] ?: body
        val articleUrl = remoteMessage.data["article_url"] ?: remoteMessage.data["url"]
        val articleImageUrl = remoteMessage.data["article_image_url"] ?: remoteMessage.data["imageUrl"]
        val articleDate = remoteMessage.data["article_date"] ?: remoteMessage.data["date"]
        val articleCategory = remoteMessage.data["article_category"] ?: remoteMessage.data["category"]
        
        sendNotification(title, body, articleTitle, articleContent, articleUrl, articleImageUrl, articleDate, articleCategory)
    }

    private fun sendNotification(
        title: String,
        body: String,
        articleTitle: String?,
        articleContent: String?,
        articleUrl: String?,
        articleImageUrl: String?,
        articleDate: String?,
        articleCategory: String?
    ) {
        val channelId = "news_notifications"
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("title", articleTitle)
            putExtra("content", articleContent)
            putExtra("url", articleUrl)
            putExtra("imageUrl", articleImageUrl)
            putExtra("date", articleDate)
            putExtra("category", articleCategory)
            putExtra("from_notification", true)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, System.currentTimeMillis().toInt(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "FlashNews24 Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
}
