package com.gamestest.games.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.gamestest.games.games.GamesHubScreen
import com.gamestest.games.games.host.GameHost

object Routes {
    const val HUB = "hub"
    const val GAME = "game/{id}"
    fun game(id: String) = "game/$id"
}

@Composable
fun GamesNavGraph(onExit: () -> Unit) {
    val nav = rememberNavController()
    NavHost(
        navController = nav,
        startDestination = Routes.HUB,
        enterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start) },
        exitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Start) },
        popEnterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.End) },
        popExitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End) },
    ) {
        composable(Routes.HUB) {
            GamesHubScreen(onBack = onExit, onOpenGame = { id -> nav.navigate(Routes.game(id)) })
        }
        composable(
            Routes.GAME,
            arguments = listOf(navArgument("id") { type = NavType.StringType })
        ) { entry ->
            GameHost(
                gameId = entry.arguments?.getString("id").orEmpty(),
                onBack = { nav.popBackStack() }
            )
        }
    }
}
