package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.unit.CreateUnitRequest;
import bo.edu.ucb.backend_simsml.dto.unit.UnitResponse;
import bo.edu.ucb.backend_simsml.dto.unit.UpdateUnitRequest;
import bo.edu.ucb.backend_simsml.entity.UnitEntity;
import bo.edu.ucb.backend_simsml.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    // Create new unit
    public Object createUnit(CreateUnitRequest request) {
        try {
            UnitEntity unit = new UnitEntity();
            unit.setName(request.name().trim());

            unitRepository.save(unit);
            return new SuccessfulResponse("201", "Unidad creada exitosamente", unit.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al crear unidad", e.getMessage());
        }
    }

    // Update unit
    public Object updateUnit(UpdateUnitRequest request) {
        try {
            UnitEntity unit = unitRepository.findById(request.unitId()).orElse(null);

            if (unit == null) {
                return new UnsuccessfulResponse("404", "Unidad no encontrada", null);
            }

            unit.setName(request.name().trim());

            unitRepository.save(unit);
            return new SuccessfulResponse("200", "Unidad actualizada exitosamente", unit.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar unidad", e.getMessage());
        }
    }

    // Find all units
    public Object getUnits(String filter, Boolean status) {
        try {
            List<UnitResponse> units = unitRepository.findAllUnits(filter, status)
                    .stream().map(unitResponse -> new UnitResponse(
                            unitResponse.getUnitId(),
                            unitResponse.getName(),
                            unitResponse.isActive()
                    )).toList();

            if (!units.isEmpty()) {
                return new SuccessfulResponse("200", "Unidades obtenidas exitosamente", units);
            }

            return new UnsuccessfulResponse("404", "No unidades registradas", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener unidades", e.getMessage());
        }
    }

    // Find unit by ID
    public Object getUnitById(Long unitId) {
        try {
            UnitResponse unit = unitRepository.findById(unitId)
                    .map(unitResponse -> new UnitResponse(
                            unitResponse.getUnitId(),
                            unitResponse.getName(),
                            unitResponse.isActive()
                    ))
                    .orElse(null);

            if (unit == null) {
                return new SuccessfulResponse("200", "Unidad obtenida exitosamente", unit);
            }

            return new UnsuccessfulResponse("404", "Unidad no encontrada", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener unidad", e.getMessage());
        }
    }

    // Disable unit
    public Object disableUnit(Long unitId) {
        try {
            UnitEntity unit = unitRepository.findById(unitId).orElse(null);

            if (unit == null) {
                return new UnsuccessfulResponse("404", "Unidad no encontrada", null);
            }

            unit.setActive(false);

            unitRepository.save(unit);

            return new SuccessfulResponse("200", "Unidad deshabilitada exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al deshabilitar unidad", e.getMessage());
        }
    }
}
