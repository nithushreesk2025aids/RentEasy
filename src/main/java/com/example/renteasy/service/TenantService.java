package com.example.renteasy.service;

import com.example.renteasy.entity.Room;
import com.example.renteasy.entity.Tenant;
import com.example.renteasy.repository.RoomRepository;
import com.example.renteasy.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;

    public TenantService(TenantRepository tenantRepository,
                         RoomRepository roomRepository) {
        this.tenantRepository = tenantRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Tenant registerTenant(Tenant tenant, Long roomId) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.isOccupied()) {
            throw new RuntimeException("Room is already occupied");
        }

        tenant.setRoom(room);
        tenant.setMoveInDate(LocalDate.now());
        tenant.setActive(true);

        room.setOccupied(true);

        roomRepository.save(room);

        return tenantRepository.save(tenant);
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant getTenantById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
    }

    @Transactional
    public Tenant vacateTenant(Long tenantId) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (!tenant.isActive()) {
            throw new RuntimeException("Tenant is already inactive");
        }

        Room room = tenant.getRoom();

        if (room != null) {
            room.setOccupied(false);
            roomRepository.save(room);
        }

        tenant.setActive(false);
        tenant.setVacateDate(LocalDate.now());

        return tenantRepository.save(tenant);
    }
}