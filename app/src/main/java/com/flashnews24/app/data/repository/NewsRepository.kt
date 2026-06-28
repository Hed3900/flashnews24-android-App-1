package com.flashnews24.app.data.repository

import android.content.Context
import com.flashnews24.app.data.api.BloggerApiService
import com.flashnews24.app.data.db.AppDatabase
import com.flashnews24.app.data.db.BookmarkEntity
import com.flashnews24.app.data.model.BloggerEntry
import kotlinx.coroutines.flow.Flow
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class NewsRepository(context: Context) {
    private val bookmarkDao = AppDatabase.getDatabase(context).bookmarkDao()

    private val apiService: BloggerApiService by lazy {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        Retrofit.Builder()
            .baseUrl("https://www.flashnews24.site/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(BloggerApiService::class.java)
    }

    suspend fun fetchLatestNews(): List<BloggerEntry> {
        return try {
            val response = apiService.getLatestPosts()
            if (response.isSuccessful) {
                response.body()?.feed?.entry ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun fetchNewsByCategory(category: String): List<BloggerEntry> {
        return try {
            val response = apiService.getPostsByCategory(category = category)
            if (response.isSuccessful) {
                response.body()?.feed?.entry ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    // Bookmarks Local operations
    fun getAllBookmarks(): Flow<List<BookmarkEntity>> = bookmarkDao.getAllBookmarks()

    suspend fun addBookmark(entry: BloggerEntry) {
        val entity = BookmarkEntity(
            id = entry.getPostId(),
            title = entry.getTitleString(),
            published = entry.getPublishedString(),
            thumbnailUrl = entry.getThumbnailUrl(),
            content = entry.getBodyContent(),
            webUrl = entry.getWebUrl(),
            categories = entry.getCategoriesList().joinToString(",")
        )
        bookmarkDao.insertBookmark(entity)
    }

    suspend fun removeBookmark(id: String) {
        bookmarkDao.deleteBookmarkById(id)
    }

    suspend fun isBookmarked(id: String): Boolean {
        return bookmarkDao.isBookmarked(id)
    }
}
