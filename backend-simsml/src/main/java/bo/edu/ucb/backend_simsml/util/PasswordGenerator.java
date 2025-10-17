package bo.edu.ucb.backend_simsml.util;

import java.security.SecureRandom;

public class PasswordGenerator {
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!";
    private static final int PASSWORD_LENGTH = 10;
    private static final SecureRandom random = new SecureRandom();

    public static String generatePassword() {
        StringBuilder stringBuilder = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            int randomIndex = random.nextInt(CHARACTERS.length());
            stringBuilder.append(CHARACTERS.charAt(randomIndex));
        }
        return stringBuilder.toString();
    }
}
