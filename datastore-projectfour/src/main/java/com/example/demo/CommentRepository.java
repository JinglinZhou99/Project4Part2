package com.example.demo;

import org.springframework.data.repository.CrudRepository;
import java.util.List;

/**
 * Repository interface for Comment entities.
 * Extends CrudRepository to provide standard CRUD operations.
 */
public interface CommentRepository extends CrudRepository<Comment, Long> {

    /**
     * Retrieves all comments and orders them in descending order by their timestamp.
     *
     * @return A list of Comment objects sorted by timestamp in descending order.
     */
    List<Comment> findAllByOrderByTimestampDesc();
}
