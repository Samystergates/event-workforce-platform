package com.eventico.finance.services.matchers;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class CompanyNameNormalizer {

    public double score(String left, String right) {
        if (StringUtils.isBlank(left) || StringUtils.isBlank(right)) {
            return 0.0;
        }
        String normalizedLeft = normalize(left);
        String normalizedRight = normalize(right);
        if (normalizedLeft.equalsIgnoreCase(normalizedRight)) {
            return 100.0;
        }
        int distance = org.apache.commons.text.similarity.LevenshteinDistance.getDefaultInstance().apply(normalizedLeft, normalizedRight);
        int max = Math.max(normalizedLeft.length(), normalizedRight.length());
        return Math.max(0, 100.0 * (1.0 - ((double) distance / max)));
    }

    private String normalize(String input) {
        return input.toLowerCase()
                .replace("b.v.", "")
                .replace("bv", "")
                .replace("b.v", "")
                .replace("gmbh", "")
                .replace("nv", "")
                .replace("co.", "")
                .replaceAll("[^a-z0-9]", "");
    }
}