package com.cyber.analysis.repository;

import com.cyber.analysis.model.ContainmentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainmentActionRepository extends JpaRepository<ContainmentAction, Long> {
    List<ContainmentAction> findByBatchId(Long batchId);
    List<ContainmentAction> findByThreatEventId(Long threatEventId);
}
