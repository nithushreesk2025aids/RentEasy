package com.example.renteasy.controller;

import com.example.renteasy.entity.Tenant;
import com.example.renteasy.service.TenantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/register/{roomId}")
    public Tenant registerTenant(
            @PathVariable Long roomId,
            @RequestBody Tenant tenant) {

        return tenantService.registerTenant(tenant, roomId);
    }

    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantService.getAllTenants();
    }

    @GetMapping("/{id}")
    public Tenant getTenantById(@PathVariable Long id) {
        return tenantService.getTenantById(id);
    }

    @PutMapping("/{id}/vacate")
    public Tenant vacateTenant(@PathVariable Long id) {
        return tenantService.vacateTenant(id);
    }
}