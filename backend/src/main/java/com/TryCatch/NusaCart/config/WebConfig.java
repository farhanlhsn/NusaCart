package com.TryCatch.NusaCart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}") 
    private String uploadDir;

    //tambhahin param path disini
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mengekspos direktori upload sebagai resource yang dapat diakses
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();
        
        // Handler untuk semua subdirektori uploads
        registry.addResourceHandler("/uploads/**") 
                .addResourceLocations("file:" + uploadAbsolutePath + "/")
                .setCachePeriod(3600); // Cache selama 1 jam 
    }
}
