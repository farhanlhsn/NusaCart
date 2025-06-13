package com.TryCatch.NusaCart.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.enums.GeneralCategory;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/general-categories")
@Slf4j
public class GeneralCategoryController {

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getAllGeneralCategories() {
        log.info("GET request to fetch all general categories");
        
        List<Map<String, String>> categories = Arrays.stream(GeneralCategory.values())
                .map(category -> Map.of(
                    "value", category.name(),
                    "displayName", category.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(categories);
    }
}