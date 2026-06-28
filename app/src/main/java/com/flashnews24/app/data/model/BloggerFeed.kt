package com.flashnews24.app.data.model

import com.google.gson.annotations.SerializedName

data class BloggerResponse(
    @SerializedName("feed") val feed: BloggerFeed?
)

data class BloggerFeed(
    @SerializedName("entry") val entry: List<BloggerEntry>?
)

data class BloggerEntry(
    @SerializedName("title") val title: TextValue?,
    @SerializedName("published") val published: TextValue?,
    @SerializedName("updated") val updated: TextValue?,
    @SerializedName("content") val content: TextValue?,
    @SerializedName("summary") val summary: TextValue?,
    @SerializedName("link") val link: List<LinkValue>?,
    @SerializedName("category") val category: List<CategoryValue>?,
    @SerializedName("media$thumbnail") val thumbnail: ThumbnailValue?
) {
    fun getTitleString(): String {
        return title?.text ?: ""
    }

    fun getPublishedString(): String {
        return published?.text ?: ""
    }

    fun getWebUrl(): String {
        return link?.firstOrNull { it.rel == "alternate" }?.href ?: ""
    }

    fun getPostId(): String {
        val webUrl = getWebUrl()
        return if (webUrl.isNotEmpty()) webUrl.hashCode().toString() else "no_id"
    }

    fun getThumbnailUrl(): String {
        return thumbnail?.url?.replace("s72-c", "s1600") ?: ""
    }

    fun getBodyContent(): String {
        return content?.text ?: summary?.text ?: ""
    }

    fun getCategoriesList(): List<String> {
        return category?.mapNotNull { it.term } ?: emptyList()
    }
}

data class TextValue(
    @SerializedName("$t") val text: String?
)

data class LinkValue(
    @SerializedName("rel") val rel: String?,
    @SerializedName("type") val type: String?,
    @SerializedName("href") val href: String?
)

data class CategoryValue(
    @SerializedName("term") val term: String?
)

data class ThumbnailValue(
    @SerializedName("url") val url: String?
)
