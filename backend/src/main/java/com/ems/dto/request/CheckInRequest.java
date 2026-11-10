package com.ems.dto.request;

public class CheckInRequest {
    private String notes;

    public CheckInRequest() {}

    public CheckInRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

