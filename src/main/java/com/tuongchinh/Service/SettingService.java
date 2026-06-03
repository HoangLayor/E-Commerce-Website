package com.tuongchinh.Service;

import com.tuongchinh.Entity.Setting;
import com.tuongchinh.Repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SettingService {
    private final SettingRepository settingRepository;

    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    public Optional<Setting> getSetting(String key) {
        return settingRepository.findById(key);
    }

    public Setting updateSetting(String key, String value, String description) {
        Setting setting = settingRepository.findById(key)
                .orElse(new Setting());
        setting.setKey(key);
        setting.setValue(value);
        if (description != null) {
            setting.setDescription(description);
        }
        return settingRepository.save(setting);
    }
}
