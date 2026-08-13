package com.cyber.analysis.repository;

import com.cyber.analysis.model.ThreatEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreatEventRepository extends JpaRepository<ThreatEvent, Long> {
    List<ThreatEvent> findByBatchId(Long batchId);
    List<ThreatEvent> findTop10ByOrderByIdDesc();
    List<ThreatEvent> findByPredictionNot(String prediction);
    List<ThreatEvent> findByDomainContainingIgnoreCaseOrDestinationUrlContainingIgnoreCaseOrClientIpContainingIgnoreCase(String domain, String url, String clientIp);
}

