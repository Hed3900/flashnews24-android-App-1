package com.flashnews24.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.flashnews24.app.ui.screen.BookmarksScreen
import com.flashnews24.app.ui.screen.DetailScreen
import com.flashnews24.app.ui.screen.HomeScreen
import com.flashnews24.app.ui.theme.FlashNews24Theme
import com.flashnews24.app.ui.viewmodel.ActiveArticle
import com.flashnews24.app.ui.viewmodel.NewsViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: NewsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.handleNotificationIntent(intent)
        
        setContent {
            val isDarkMode by viewModel.isDarkMode.collectAsState()
            
            FlashNews24Theme(darkTheme = isDarkMode) {
                val navController = rememberNavController()
                
                // Request Notification Permission on Android 13+ (API 33+)
                val context = androidx.compose.ui.platform.LocalContext.current
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                    val launcher = androidx.activity.compose.rememberLauncherForActivityResult(
                        contract = androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
                    ) { _ -> }
                    
                    androidx.compose.runtime.LaunchedEffect(Unit) {
                        if (androidx.core.content.ContextCompat.checkSelfPermission(
                                context,
                                android.Manifest.permission.POST_NOTIFICATIONS
                            ) != android.content.pm.PackageManager.PERMISSION_GRANTED
                        ) {
                            launcher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                        }
                    }
                }

                // Handle Pending Notification Article Navigation
                val pendingArticle by viewModel.pendingNotificationArticle.collectAsState()
                androidx.compose.runtime.LaunchedEffect(pendingArticle) {
                    pendingArticle?.let { article ->
                        viewModel.selectArticle(article)
                        viewModel.clearPendingNotification()
                        navController.navigate("detail")
                    }
                }
                
                NavHost(
                    navController = navController,
                    startDestination = "home"
                ) {
                    // Route 1: Home Dashboard Screen
                    composable("home") {
                        HomeScreen(
                            viewModel = viewModel,
                            onNavigateToDetail = { title, content, url, imageUrl, date, category ->
                                viewModel.selectArticle(
                                    ActiveArticle(
                                        title = title,
                                        content = content,
                                        url = url,
                                        imageUrl = imageUrl,
                                        date = date,
                                        category = category
                                    )
                                )
                                navController.navigate("detail")
                            },
                            onNavigateToBookmarks = {
                                navController.navigate("bookmarks")
                            }
                        )
                    }
                    
                    // Route 2: Article Detail Reader Screen
                    composable("detail") {
                        val activeArticle by viewModel.activeArticle.collectAsState()
                        activeArticle?.let { article ->
                            DetailScreen(
                                title = article.title,
                                content = article.content,
                                url = article.url,
                                imageUrl = article.imageUrl,
                                date = article.date,
                                category = article.category,
                                viewModel = viewModel,
                                onNavigateBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                    }
                    
                    // Route 3: Local Saved Bookmarks Screen
                    composable("bookmarks") {
                        BookmarksScreen(
                            viewModel = viewModel,
                            onNavigateToDetail = { title, content, url, imageUrl, date, category ->
                                viewModel.selectArticle(
                                    ActiveArticle(
                                        title = title,
                                        content = content,
                                        url = url,
                                        imageUrl = imageUrl,
                                        date = date,
                                        category = category
                                    )
                                )
                                navController.navigate("detail")
                            },
                            onNavigateBack = {
                                navController.popBackStack()
                            }
                        )
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        viewModel.handleNotificationIntent(intent)
    }
}
