package com.flashnews24.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.flashnews24.app.data.db.BookmarkEntity
import com.flashnews24.app.data.model.*
import com.flashnews24.app.data.repository.NewsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface NewsUiState {
    object Loading : NewsUiState
    data class Success(val articles: List<BloggerEntry>) : NewsUiState
    data class Error(val message: String) : NewsUiState
}

// Unified ActiveArticle representation for safe, param-free Navigation
data class ActiveArticle(
    val title: String,
    val content: String,
    val url: String,
    val imageUrl: String,
    val date: String,
    val category: String
)

class NewsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NewsRepository(application)

    private val _rawArticles = MutableStateFlow<List<BloggerEntry>>(emptyList())
    
    private val _uiState = MutableStateFlow<NewsUiState>(NewsUiState.Loading)
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("Home")
    val selectedCategory = _selectedCategory.asStateFlow()

    private val _isDarkMode = MutableStateFlow(false)
    val isDarkMode = _isDarkMode.asStateFlow()

    // Safe active reading article state
    private val _activeArticle = MutableStateFlow<ActiveArticle?>(null)
    val activeArticle = _activeArticle.asStateFlow()

    // Notification article pending to be read
    private val _pendingNotificationArticle = MutableStateFlow<ActiveArticle?>(null)
    val pendingNotificationArticle = _pendingNotificationArticle.asStateFlow()

    // Live list of articles filtered by search query
    val filteredArticles: StateFlow<List<BloggerEntry>> = combine(_rawArticles, _searchQuery) { articles, query ->
        if (query.isBlank()) {
            articles
        } else {
            articles.filter {
                it.getTitleString().contains(query, ignoreCase = true) ||
                        it.getBodyContent().contains(query, ignoreCase = true)
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val bookmarks: StateFlow<List<BookmarkEntity>> = repository.getAllBookmarks()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadNews()
    }

    fun toggleDarkMode() {
        _isDarkMode.value = !_isDarkMode.value
    }

    fun selectArticle(article: ActiveArticle) {
        _activeArticle.value = article
    }

    fun setCategory(category: String) {
        if (_selectedCategory.value == category) return
        _selectedCategory.value = category
        _searchQuery.value = "" // Clear search when switching categories
        loadNews()
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun loadNews() {
        viewModelScope.launch {
            _uiState.value = NewsUiState.Loading
            val category = _selectedCategory.value
            val entries = if (category == "Home") {
                repository.fetchLatestNews()
            } else {
                repository.fetchNewsByCategory(category)
            }
            
            _rawArticles.value = entries
            if (entries.isEmpty()) {
                if (category == "Home") {
                    _uiState.value = NewsUiState.Error("Failed to fetch news. Please verify network connection.")
                } else {
                    _uiState.value = NewsUiState.Success(emptyList()) // Category feed might be empty currently
                }
            } else {
                _uiState.value = NewsUiState.Success(entries)
            }
        }
    }

    fun toggleBookmark(entry: BloggerEntry, isCurrentlyBookmarked: Boolean) {
        viewModelScope.launch {
            if (isCurrentlyBookmarked) {
                repository.removeBookmark(entry.getPostId())
            } else {
                repository.addBookmark(entry)
            }
        }
    }

    fun removeBookmarkById(id: String) {
        viewModelScope.launch {
            repository.removeBookmark(id)
        }
    }

    fun handleNotificationIntent(intent: android.content.Intent?) {
        if (intent == null) return
        val fromNotification = intent.getBooleanExtra("from_notification", false)
        if (fromNotification) {
            val title = intent.getStringExtra("title") ?: ""
            val content = intent.getStringExtra("content") ?: ""
            val url = intent.getStringExtra("url") ?: ""
            val imageUrl = intent.getStringExtra("imageUrl") ?: ""
            val date = intent.getStringExtra("date") ?: ""
            val category = intent.getStringExtra("category") ?: ""
            
            if (title.isNotEmpty() && url.isNotEmpty()) {
                val article = ActiveArticle(title, content, url, imageUrl, date, category)
                _pendingNotificationArticle.value = article
                // Clear the extra so it doesn't trigger again on configuration changes
                intent.removeExtra("from_notification")
            }
        }
    }

    fun clearPendingNotification() {
        _pendingNotificationArticle.value = null
    }
}
