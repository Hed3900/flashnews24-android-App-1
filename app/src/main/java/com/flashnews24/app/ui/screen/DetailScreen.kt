package com.flashnews24.app.ui.screen

import android.content.Intent
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.flashnews24.app.ui.viewmodel.NewsViewModel
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(
    title: String,
    content: String,
    url: String,
    imageUrl: String,
    date: String,
    category: String,
    viewModel: NewsViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val isDarkMode by viewModel.isDarkMode.collectAsState()
    val bookmarks by viewModel.bookmarks.collectAsState()

    // Match bookmarks by generated article ID from URL hash
    val articleId = url.hashCode().toString()
    val isBookmarked = bookmarks.any { it.id == articleId }

    Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Read Article", fontSize = 18.sp, fontWeight = FontWeight.Bold) },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        // Dynamic Local Bookmark Toggle
                        IconButton(onClick = {
                            val entry = com.flashnews24.app.data.model.BloggerEntry(
                                title = com.flashnews24.app.data.model.TextValue(title),
                                published = com.flashnews24.app.data.model.TextValue(date),
                                updated = null,
                                content = com.flashnews24.app.data.model.TextValue(content),
                                summary = null,
                                link = listOf(com.flashnews24.app.data.model.LinkValue("alternate", "text/html", url)),
                                category = listOf(com.flashnews24.app.data.model.CategoryValue(category)),
                                thumbnail = if (imageUrl.isNotEmpty()) com.flashnews24.app.data.model.ThumbnailValue(imageUrl) else null
                            )
                            viewModel.toggleBookmark(entry, isBookmarked)
                        }) {
                            Icon(
                                imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = "Bookmark",
                                tint = if (isBookmarked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                        }

                        // Share Action via Standard Android Intent
                        IconButton(onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, title)
                                putExtra(Intent.EXTRA_TEXT, "$title\n\nRead full article at: $url\n\nShared via FlashNews24")
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share News Article"))
                        }) {
                            Icon(imageVector = Icons.Default.Share, contentDescription = "Share")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                // Main Header Information
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f),
                                shape = RoundedCornerShape(6.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = category.uppercase(),
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = title,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 28.sp,
                        color = MaterialTheme.colorScheme.onBackground
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = date,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.1f))
                }

                // Interactive Web Content Body with beautiful matching CSS
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    AndroidView(
                        modifier = Modifier.fillMaxSize(),
                        factory = { ctx ->
                            WebView(ctx).apply {
                                webViewClient = WebViewClient()
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                            }
                        },
                        update = { webView ->
                            // Custom responsive CSS injectors based on current theme setting
                            val textColor = if (isDarkMode) "#E2E2E6" else "#1A1C1E"
                            val bgColor = if (isDarkMode) "#121314" else "#F8F9FA"
                            val linkColor = "#0061A4"
                            
                            val styledHtml = """
                                <html>
                                <head>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body {
                                        background-color: $bgColor;
                                        color: $textColor;
                                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                        font-size: 16px;
                                        line-height: 1.6;
                                        padding: 8px 16px;
                                        margin: 0;
                                    }
                                    img {
                                        max-width: 100%;
                                        height: auto;
                                        border-radius: 12px;
                                        margin: 12px 0;
                                    }
                                    iframe {
                                        max-width: 100%;
                                        border-radius: 12px;
                                        margin: 12px 0;
                                    }
                                    a {
                                        color: $linkColor;
                                        text-decoration: none;
                                        font-weight: bold;
                                    }
                                </style>
                                </head>
                                <body>
                                    $content
                                </body>
                                </html>
                            """.trimIndent()
                            
                            webView.loadDataWithBaseURL(null, styledHtml, "text/html", "UTF-8", null)
                        }
                    )
                }
            }
        }
}
