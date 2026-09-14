package tests;

import base.BaseTest;
import pages.MoviePage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MovieSearchTest extends BaseTest {

    @Test
    public void searchMovieTest() {
        MoviePage moviePage = new MoviePage(driver);
        moviePage.searchMovie("Inception");
        Assert.assertTrue(moviePage.isMovieDisplayed());
    }
}