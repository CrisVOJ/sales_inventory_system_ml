package bo.edu.ucb.backend_simsml.dto.unit;

import bo.edu.ucb.backend_simsml.entity.UnitEntity;

public record UnitResponse(
        Long unitId,
        String name,
        boolean active
) {
    public static UnitResponse from(UnitEntity unit) {
        if (unit == null) return null;
        return new UnitResponse(unit.getUnitId(), unit.getName(), unit.isActive());
    }
}
