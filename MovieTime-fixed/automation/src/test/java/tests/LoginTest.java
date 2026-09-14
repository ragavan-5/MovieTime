package tests;

import base.BaseTest;
import pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test
    public void validLoginTest() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("test@gmail.com", "password123");
        Assert.assertTrue(driver.getTitle().contains("Movie"));
    }
}