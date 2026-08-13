package com.cyber.analysis.repository;

import com.cyber.analysis.model.AnalysisBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisBatchRepository extends JpaRepository<AnalysisBatch, Long> {
    List<AnalysisBatch> findAllByOrderByCreatedAtDesc();
}
