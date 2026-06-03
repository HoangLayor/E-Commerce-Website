package com.tuongchinh.Controller;

import com.tuongchinh.Entity.Setting;
import com.tuongchinh.Service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
public class SettingController {
    private final SettingService settingService;

    @GetMapping("/public/settings")
    public ResponseEntity<List<Setting>> getAllPublic() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @GetMapping("/admin/settings")
    public ResponseEntity<List<Setting>> getAllAdmin() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping("/admin/settings")
    public ResponseEntity<Setting> update(@RequestBody Setting setting) {
        return ResponseEntity.ok(settingService.updateSetting(setting.getKey(), setting.getValue(), setting.getDescription()));
    }
}
