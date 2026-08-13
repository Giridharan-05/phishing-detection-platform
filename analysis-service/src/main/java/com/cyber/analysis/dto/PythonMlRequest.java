package com.cyber.analysis.dto;

public class PythonMlRequest {
    private String content;
    private String filename;

    public PythonMlRequest() {
    }

    public PythonMlRequest(String content, String filename) {
        this.content = content;
        this.filename = filename;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
}
