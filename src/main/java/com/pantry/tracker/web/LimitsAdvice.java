package com.pantry.tracker.web;

import com.pantry.tracker.service.InputLimits;
import java.util.Map;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class LimitsAdvice {

    private static final Map<String, Object> LIMITS = Map.ofEntries(
            Map.entry("itemName", InputLimits.ITEM_NAME),
            Map.entry("locationName", InputLimits.LOCATION_NAME),
            Map.entry("categoryName", InputLimits.CATEGORY_NAME),
            Map.entry("categoryGroup", InputLimits.CATEGORY_GROUP),
            Map.entry("search", InputLimits.SEARCH),
            Map.entry("email", InputLimits.EMAIL),
            Map.entry("password", InputLimits.PASSWORD),
            Map.entry("quantity", InputLimits.QUANTITY_MAX),
            Map.entry("shelfLifeDays", InputLimits.SHELF_LIFE_MAX_DAYS),
            Map.entry("dateMin", InputLimits.DATE_MIN.toString()),
            Map.entry("dateMax", InputLimits.DATE_MAX.toString()));

    @ModelAttribute("limits")
    public Map<String, Object> limits() {
        return LIMITS;
    }
}
