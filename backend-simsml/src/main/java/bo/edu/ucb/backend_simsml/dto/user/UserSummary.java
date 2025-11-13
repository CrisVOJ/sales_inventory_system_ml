package bo.edu.ucb.backend_simsml.dto.user;

import bo.edu.ucb.backend_simsml.entity.UserEntity;

public record UserSummary(
        Long userId,
        String name,
        String paternalSurname,
        String username
) {
    public static UserSummary from(UserEntity user) {
        if (user == null) return null;
        return new UserSummary(user.getUserId(), user.getName(), user.getPaternalSurname(), user.getUsername());
    }
}
