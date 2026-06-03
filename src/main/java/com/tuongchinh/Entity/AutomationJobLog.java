package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "automation_job_logs")
@Getter
@Setter
public class AutomationJobLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_name")
    private String jobName;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "trigger_type")
    private String triggerType; // AUTO or MANUAL

    @Column(name = "status")
    private String status; // SUCCESS or ERROR

    @Column(name = "details", columnDefinition = "LONGTEXT")
    private String details; // JSON format logs

    @Column(name = "orders_processed")
    private int ordersProcessed = 0;

    @Column(name = "orders_cancelled")
    private int ordersCancelled = 0;

    @Column(name = "orders_confirmed")
    private int ordersConfirmed = 0;
}
