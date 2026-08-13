package com.cyber.analysis.client;

import com.cyber.analysis.dto.PythonMlRequest;
import com.cyber.analysis.dto.PythonMlResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "python-ml-service", url = "${python.ml.service.url:http://localhost:5000}")
public interface PythonMlClient {

    @PostMapping("/ml/analyze")
    PythonMlResponse analyzeLogs(@RequestBody PythonMlRequest request);
}
