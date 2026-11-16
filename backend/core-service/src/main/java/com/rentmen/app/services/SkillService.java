package com.rentmen.app.services;

import com.rentmen.app.DTO.SkillDto;

import java.util.List;
import java.util.Set;

public interface SkillService {
	SkillDto createSkill(SkillDto skillDto);

	Set<SkillDto> getAllSkills();

	List<SkillDto> getAllSkillsList();



}
