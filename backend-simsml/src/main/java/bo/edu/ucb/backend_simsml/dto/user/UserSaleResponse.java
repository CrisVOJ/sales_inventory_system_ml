package bo.edu.ucb.backend_simsml.dto.user;

import bo.edu.ucb.backend_simsml.entity.UserEntity;

public record UserSaleResponse(
        Long userId,
        String name,
        String paternalSurname,
        String username
) {
    public static UserSaleResponse from(UserEntity user) {
        if (user == null) return null;
        return new UserSaleResponse(user.getUserId(), user.getName(), user.getPaternalSurname(), user.getUsername());
    }
}
