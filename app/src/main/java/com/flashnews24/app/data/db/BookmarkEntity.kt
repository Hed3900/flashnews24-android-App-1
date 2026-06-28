package com.flashnews24.app.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bookmarks")
data class BookmarkEntity(
    @PrimaryKey val id: String,
    val title: String,
    val published: String,
    val thumbnailUrl: String,
    val content: String,
    val webUrl: String,
    val categories: String
)
