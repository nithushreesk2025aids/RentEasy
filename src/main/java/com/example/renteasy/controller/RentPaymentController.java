package com.example.renteasy.controller;

import com.example.renteasy.entity.RentPayment;
import com.example.renteasy.entity.Tenant;
import com.example.renteasy.service.RentPaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class RentPaymentController {

    private final RentPaymentService rentPaymentService;

    public RentPaymentController(RentPaymentService rentPaymentService) {
        this.rentPaymentService = rentPaymentService;
    }

    @PostMapping("/{tenantId}")
    public RentPayment recordPayment(
            @PathVariable Long tenantId,
            @RequestBody RentPayment payment) {

        return rentPaymentService.recordPayment(tenantId, payment);
    }

    @GetMapping
    public List<RentPayment> getAllPayments() {
        return rentPaymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public RentPayment getPaymentById(@PathVariable Long id) {
        return rentPaymentService.getPaymentById(id);
    }

    @GetMapping("/tenant/{tenantId}/pending-dues")
    public int getPendingDues(@PathVariable Long tenantId) {
        return rentPaymentService.getPendingDues(tenantId);
    }

    @GetMapping("/unpaid/current-month")
    public List<Tenant> getUnpaidTenantsForCurrentMonth() {
        return rentPaymentService.getUnpaidTenantsForCurrentMonth();
    }
}