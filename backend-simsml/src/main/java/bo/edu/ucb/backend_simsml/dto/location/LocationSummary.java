package bo.edu.ucb.backend_simsml.dto.location;

import bo.edu.ucb.backend_simsml.entity.LocationEntity;

public record LocationSummary(
        Long locationId,
        String code,
        String name
) {
    public static LocationSummary from(LocationEntity location) {
        if (location == null) return null;
        return new LocationSummary(location.getLocationId(), location.getCode(), location.getName());
    }
}
