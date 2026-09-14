package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class MoviePage {

    WebDriver driver;

    private By searchInput = By.id("searchInput");
    private By searchButton = By.id("searchBtn");
    private By movieCard = By.className("movie-card");
    private By movieTitle = By.className("movie-title");

    public MoviePage(WebDriver driver) {
        this.driver = driver;
    }

    public void searchMovie(String movieName) {
        driver.findElement(searchInput).clear();
        driver.findElement(searchInput).sendKeys(movieName);
        driver.findElement(searchButton).click();
    }

    public boolean isMovieDisplayed() {
        return driver.findElement(movieCard).isDisplayed();
    }

    public String getMovieTitle() {
        return driver.findElement(movieTitle).getText();
    }
}