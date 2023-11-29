package com.example.demo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
public class GameController {

  private final GameRecordRepository gameRecordRepository;

  private final CommentRepository commentRepository;

  public GameController(GameRecordRepository gameRecordRepository, CommentRepository commentRepository) {
    this.gameRecordRepository = gameRecordRepository;
    this.commentRepository = commentRepository;
  }

  @PostMapping("/addGameRecord")
  @CrossOrigin(origins = "*")
  public String addGameRecord(@RequestBody GameRecord gameRecord) {
    if (gameRecord == null) {
      return "The gameRecord is invalid";
    }
    this.gameRecordRepository.save(gameRecord);
    return "success";
  }

  @GetMapping("/findByUserId")
  @CrossOrigin(origins = "*")
  public List<GameRecord> findByUserId(@RequestParam String userId) {
    return gameRecordRepository.findByUserId(userId);
  }

  @GetMapping("/showAllRecords")
  @ResponseBody
  @CrossOrigin(origins = "*")
  public List<GameRecord> showAllRecords() {
    Iterable<GameRecord> gameRecords = this.gameRecordRepository.findAll();
    List<GameRecord> recordList = new ArrayList<>();
    gameRecords.forEach(recordList::add);
    return recordList;
  }

  // Additional endpoints for updating a user's handle and deleting game records
  @DeleteMapping("/deleteByUserId")
  @CrossOrigin(origins = "*")
  public String deleteByUserId(@RequestParam String userId) {
    gameRecordRepository.deleteByUserId(userId);
    return "Deleted records for userId: " + userId;
  }

  @DeleteMapping("/deleteByHandle")
  @CrossOrigin(origins = "*")
  public String deleteByHandle(@RequestParam String handle) {
    gameRecordRepository.deleteByHandle(handle);
    return "Deleted records for handle: " + handle;
  }

  @GetMapping("/checkHandle")
  @CrossOrigin(origins = "*")
  public ResponseEntity<Boolean> checkHandle(@RequestParam String handle, @RequestParam String userId) {
    Iterable<GameRecord> allRecords = gameRecordRepository.findAll();
    for (GameRecord record : allRecords) {
      if (handle.equals(record.getHandle()) && !userId.equals(record.getUserId())) {
        return ResponseEntity.ok(true); // Handle is in use by another user
      }
    }
    return ResponseEntity.ok(false); // Handle is not in use
  }

  @PutMapping("/updateHandleByUserId")
  @CrossOrigin(origins = "*")
  public String updateHandleByUserId(@RequestParam String userId, @RequestParam String newHandle) {
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

  @PostMapping("/addComment")
  public ResponseEntity<String> addComment(@RequestBody Comment comment) {
    comment.setTimestamp(LocalDateTime.now());
    commentRepository.save(comment);
    return ResponseEntity.ok("Comment added successfully");
  }

  @GetMapping("/getComments")
  public ResponseEntity<List<Comment>> getComments() {
    return ResponseEntity.ok(commentRepository.findAllByOrderByTimestampDesc());
  }

}