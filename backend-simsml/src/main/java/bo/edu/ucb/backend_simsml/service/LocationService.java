package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.category.CategoryResponse;
import bo.edu.ucb.backend_simsml.dto.category.UpdateCategoryRequest;
import bo.edu.ucb.backend_simsml.dto.location.CreateLocationRequest;
import bo.edu.ucb.backend_simsml.dto.location.LocationResponse;
import bo.edu.ucb.backend_simsml.dto.location.LocationSummary;
import bo.edu.ucb.backend_simsml.dto.location.UpdateLocationRequest;
import bo.edu.ucb.backend_simsml.entity.CategoryEntity;
import bo.edu.ucb.backend_simsml.entity.LocationEntity;
import bo.edu.ucb.backend_simsml.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    public Object createLocation(CreateLocationRequest request) {
        try {
            LocationEntity location = new LocationEntity();
            location.setCode(request.code().trim());
            location.setName(request.name().trim());

            locationRepository.save(location);
            return new SuccessfulResponse("201", "Ubicación creada exitosamente", location.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al crear ubicación", e.getMessage());
        }
    }

    public Object getLocations(String filter, Boolean status, Pageable pageable) {
        try {
            Page<LocationResponse> locations = locationRepository.findAllLocations(filter, status, pageable)
                    .map(locationResponse -> new LocationResponse(
                            locationResponse.getLocationId(),
                            locationResponse.getCode(),
                            locationResponse.getName(),
                            locationResponse.isActive()
                    ));

            if (!locations.isEmpty()) {
                return new SuccessfulResponse("200", "Ubicaciones encontradas", locations);
            }

            return new UnsuccessfulResponse("404", "No hay ubicaciones registradas", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener ubicaciones", e.getMessage());
        }
    }

    public Object getLocationsSummary() {
        try {
            List<LocationSummary> locations = locationRepository.findAllLocationSummary()
                    .stream().map(locationSummary -> new LocationSummary(
                            locationSummary.getLocationId(),
                            locationSummary.getCode(),
                            locationSummary.getName()
                    )).toList();

            if (!locations.isEmpty()) {
                return new SuccessfulResponse("200", "Resumen de ubicaciones encontradas", locations);
            }

            return new UnsuccessfulResponse("404", "No hay ubicaciones registradas", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener resumen de ubicaciones", e.getMessage());
        }
    }

    public Object getLocationById(Long locationId) {
        try {
            LocationResponse location = locationRepository.findById(locationId)
                    .map(locationResponse -> new LocationResponse(
                            locationResponse.getLocationId(),
                            locationResponse.getCode(),
                            locationResponse.getName(),
                            locationResponse.isActive()
                    )).orElse(null);

            if (location != null) {
                return new SuccessfulResponse("200", "Ubicación encontrada", location);
            }

            return new UnsuccessfulResponse("404", "Ubicación no encontrada", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener ubicación", e.getMessage());
        }
    }

    public Object updateLocation(UpdateLocationRequest request) {
        try {
            LocationEntity location = locationRepository.findById(request.locationId()).orElse(null);

            if (location == null) {
                return new UnsuccessfulResponse("404", "Ubicación no encontrada", null);
            }

            location.setCode(request.code().trim());
            location.setName(request.name().trim());
            location.setUpdatedAt(LocalDateTime.now());

            locationRepository.save(location);
            return new SuccessfulResponse("200", "Ubicación actualizada", location.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar ubicación", e.getMessage());
        }
    }

    public Object disableLocation(Long locationId) {
        try {
            LocationEntity location = locationRepository.findById(locationId).orElse(null);

            if (location == null) {
                return new UnsuccessfulResponse("404", "Ubicación no encontrada", null);
            }

            location.setActive(false);
            locationRepository.save(location);
            return new SuccessfulResponse("200", "Ubicación eliminada", location.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar ubicación", e.getMessage());
        }
    }
}
