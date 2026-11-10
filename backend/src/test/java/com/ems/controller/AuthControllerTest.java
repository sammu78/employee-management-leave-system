package com.ems.controller;

import com.ems.dto.request.LoginRequest;
import com.ems.dto.response.AuthResponse;
import com.ems.entity.enums.Role;
import com.ems.security.JwtAuthenticationEntryPoint;
import com.ems.security.JwtAuthenticationFilter;
import com.ems.security.JwtTokenProvider;
import com.ems.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /api/auth/login should return 200 with JWT response")
    void testLoginEndpoint() throws Exception {
        LoginRequest request = new LoginRequest("test@ems.com", "password123");
        AuthResponse response = new AuthResponse(
                "mock.jwt.token",
                1L,
                "test@ems.com",
                Role.ROLE_EMPLOYEE.name(),
                10L,
                "EMP-1001",
                "Alice",
                "Wonder"
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.data.email").value("test@ems.com"))
                .andExpect(jsonPath("$.data.firstName").value("Alice"));
    }

    @Test
    @DisplayName("POST /api/auth/login with invalid email should return 400 Bad Request")
    void testLoginValidationFailure() throws Exception {
        LoginRequest invalidRequest = new LoginRequest("not-an-email", "123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
