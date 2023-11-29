package com.example.demo;

import com.google.api.client.util.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.shell.standard.ShellMethod;

import java.util.List;

@SpringBootApplication
public class DemoApplication {

    @Autowired
    GameRecordRepository gameRecordRepository;
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @ShellMethod("Load all game records")
    public String showAllRecords() {
        Iterable<GameRecord> gameRecords = this.gameRecordRepository.findAll();
        return Lists.newArrayList(gameRecords).toString();
    }

    @ShellMethod("Loads game records by userId: find-by-userId <userId>")
    public String findByUserId(String userId){
        List<GameRecord> gameRecords = this.gameRecordRepository.findByUserId(userId);
        return gameRecords.toString();
    }

    @ShellMethod("Deletes game records by userId: delete-by-userId <userId>")
    public String deleteByUserId(String userId) {
        gameRecordRepository.deleteByUserId(userId);
        return "Deleted game records for userId: " + userId;
    }

    @ShellMethod("Deletes game records by handle: delete-by-handle <handle>")
    public String deleteByHandle(String handle) {
        gameRecordRepository.deleteByHandle(handle);
        return "Deleted game records for handle: " + handle;
    }

    @ShellMethod("Check if a handle is in use by another userId: check-handle <handle> <userId>")
    public String checkHandle(String handle, String userId) {
        Iterable<GameRecord> allRecords = gameRecordRepository.findAll();
        for (GameRecord record : allRecords) {
            if (handle.equals(record.getHandle()) && !userId.equals(record.getUserId())) {
                return "Handle is in use by another user";
            }
        }
        return "Handle is available";
    }

    @ShellMethod("Update user's handle by userId: update-handle <userId> <newHandle>")
    public String updateHandleByUserId(String userId, String newHandle) {
        // Make a call to your GameController's method to update the handle
        // Since this is a shell application, you need to either autowire GameController
        // or directly use GameRecordRepository here.

        List<GameRecord> recordsToUpdate = gameRecordRepository.findByUserId(userId);

        if (recordsToUpdate.isEmpty()) {
            return "No records found for userId: " + userId;
        }

        for (GameRecord record : recordsToUpdate) {
            record.setHandle(newHandle);
        }

        gameRecordRepository.saveAll(recordsToUpdate);
        return "Updated handle for userId: " + userId;
    }
}
