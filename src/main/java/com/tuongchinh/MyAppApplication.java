package com.tuongchinh;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import com.tuongchinh.Repository.SettingRepository;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class MyAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyAppApplication.class, args);
    }

    @Bean
    public CommandLineRunner resetSettings(SettingRepository repo) {
        return args -> {
            repo.deleteAll();
            System.out.println("========== ALL CORRUPTED SETTINGS DELETED ==========");
        };
    }
}
