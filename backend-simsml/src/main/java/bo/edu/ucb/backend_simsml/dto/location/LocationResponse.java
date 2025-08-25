package bo.edu.ucb.backend_simsml.dto.location;

import bo.edu.ucb.backend_simsml.entity.LocationEntity;

public record LocationResponse(
        Long locationId,
        String code,
        String name,
        boolean active
) {
    public static LocationResponse from(LocationEntity location) {
        if (location == null) return null;
        return new LocationResponse(location.getLocationId(), location.getCode(), location.getName(), location.isActive());
    }
}
