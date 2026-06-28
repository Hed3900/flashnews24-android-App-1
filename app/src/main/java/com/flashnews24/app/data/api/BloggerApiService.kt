package com.flashnews24.app.data.api

import com.flashnews24.app.data.model.BloggerResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface BloggerApiService {
    @GET("feeds/posts/default")
    suspend fun getLatestPosts(
        @Query("alt") alt: String = "json",
        @Query("max-results") maxResults: Int = 50
    ): Response<BloggerResponse>

    @GET("feeds/posts/default/-/{category}")
    suspend fun getPostsByCategory(
        @Path("category") category: String,
        @Query("alt") alt: String = "json",
        @Query("max-results") maxResults: Int = 50
    ): Response<BloggerResponse>
}
