package com.example.renteasy.repository;

import com.example.renteasy.entity.RentPayment;
import com.example.renteasy.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentPaymentRepository extends JpaRepository<RentPayment, Long> {

    List<RentPayment> findByTenant(Tenant tenant);

    boolean existsByTenantAndMonth(Tenant tenant, String month);

    List<RentPayment> findByMonth(String month);
}