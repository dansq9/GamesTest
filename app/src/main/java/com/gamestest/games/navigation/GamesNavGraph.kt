package com.gamestest.games.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.gamestest.games.games.GameId
import com.gamestest.games.games.GamesHubScreen
import com.gamestest.games.games.patches.PatchesScreen
import com.gamestest.games.games.queens.QueensScreen
import com.gamestest.games.games.sudoku.SudokuScreen
import com.gamestest.games.games.tango.TangoScreen
import com.gamestest.games.games.zip.ZipScreen
import com.gamestest.games.home.HomeScreen

object Routes {
    const val HOME = "home"
    const val HUB = "hub"
}

@Composable
fun GamesNavGraph() {
    val nav = rememberNavController()

    NavHost(
        navController = nav,
        startDestination = Routes.HOME,
        enterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start) },
        exitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Start) },
        popEnterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.End) },
        popExitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End) },
    ) {
        composable(Routes.HOME) {
            HomeScreen(onOpenGames = { nav.navigate(Routes.HUB) })
        }
        composable(Routes.HUB) {
            GamesHubScreen(
                onBack = { nav.popBackStack() },
                onOpenGame = { game -> nav.navigate(game.route) }
            )
        }
        composable(GameId.SUDOKU.route) { SudokuScreen(onBack = { nav.popBackStack() }) }
        composable(GameId.QUEENS.route) { QueensScreen(onBack = { nav.popBackStack() }) }
        composable(GameId.TANGO.route) { TangoScreen(onBack = { nav.popBackStack() }) }
        composable(GameId.ZIP.route) { ZipScreen(onBack = { nav.popBackStack() }) }
        composable(GameId.PATCHES.route) { PatchesScreen(onBack = { nav.popBackStack() }) }
    }
}
