package com.ems.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
            "/login",
            "/register",
            "/dashboard",
            "/admin/**",
            "/employees/**",
            "/leaves/**",
            "/attendance",
            "/departments",
            "/profile",
            "/access-denied"
    })
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}
