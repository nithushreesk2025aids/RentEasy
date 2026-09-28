package com.example.renteasy.service;

import com.example.renteasy.entity.RentPayment;
import com.example.renteasy.entity.Tenant;
import com.example.renteasy.repository.RentPaymentRepository;
import com.example.renteasy.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RentPaymentService {

    private final RentPaymentRepository rentPaymentRepository;
    private final TenantRepository tenantRepository;

    public RentPaymentService(RentPaymentRepository rentPaymentRepository,
                              TenantRepository tenantRepository) {
        this.rentPaymentRepository = rentPaymentRepository;
        this.tenantRepository = tenantRepository;
    }

    public RentPayment recordPayment(Long tenantId, RentPayment payment) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (!tenant.isActive()) {
            throw new RuntimeException("Tenant is not active");
        }

        if (payment.getMonth() == null || payment.getMonth().isBlank()) {
            throw new RuntimeException("Payment month is required");
        }

        if (rentPaymentRepository.existsByTenantAndMonth(
                tenant, payment.getMonth())) {
            throw new RuntimeException(
                    "Rent already paid for " + payment.getMonth());
        }

        payment.setTenant(tenant);

        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }

        return rentPaymentRepository.save(payment);
    }

    public List<RentPayment> getAllPayments() {
        return rentPaymentRepository.findAll();
    }

    public RentPayment getPaymentById(Long id) {
        return rentPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public int getPendingDues(Long tenantId) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        LocalDate moveInDate = tenant.getMoveInDate();
        LocalDate today = LocalDate.now();

        int monthsSinceMoveIn =
                (today.getYear() - moveInDate.getYear()) * 12
                        + (today.getMonthValue() - moveInDate.getMonthValue())
                        + 1;

        List<RentPayment> payments =
                rentPaymentRepository.findByTenant(tenant);

        int monthsPaid = payments.size();

        return Math.max(0, monthsSinceMoveIn - monthsPaid);
    }

    public List<Tenant> getUnpaidTenantsForCurrentMonth() {

        String currentMonth = LocalDate.now().toString().substring(0, 7);

        List<Tenant> activeTenants = tenantRepository.findByActiveTrue();

        List<RentPayment> currentMonthPayments =
                rentPaymentRepository.findByMonth(currentMonth);

        return activeTenants.stream()
                .filter(tenant -> currentMonthPayments.stream()
                        .noneMatch(payment ->
                                payment.getTenant().getId().equals(tenant.getId())))
                .toList();
    }
}