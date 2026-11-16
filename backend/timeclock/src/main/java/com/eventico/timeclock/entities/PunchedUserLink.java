package com.eventico.timeclock.entities;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "punched_user_link")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PunchedUserLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "punch_id")
    private Long punchId;

    @Column(name = "link_id")
    private Long linkId;
}
