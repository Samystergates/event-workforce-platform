package com.rentmen.app.services.imp;

import com.rentmen.app.configurations.JwtTokenHelper;
import com.rentmen.app.entities.Job;
import com.rentmen.app.repositories.PunchesDetailsRepo;
import com.rentmen.app.services.MessageService;
import com.rentmen.app.utils.MessageTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Locale;

@Component
public class MessageServiceImpl implements MessageService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MessageServiceImpl.class);

    @Autowired
    @Qualifier("validationMessageSource")
    private MessageSource mSource;

    @Value("${form.sp.uri}")
    private String spUI;

    @Value("${eventico.contact-email}")
    private String contactEmail;

    @Autowired
    PunchesDetailsRepo punchesDetailsRepo;

    @Autowired
    JwtTokenHelper jwtTokenHelper;

    @Autowired
    TwilioMessageService twilioMessageService;

    @Autowired
    EmailSendingService emailSendingService;

    public MessageServiceImpl(MessageSource mSource) {
        this.mSource = mSource;
    }

    @Override
    public String getMessage(String id) {
        Locale locale = LocaleContextHolder.getLocale();
        String message;
        try {
            message = mSource.getMessage(id, null, locale);
        } catch (NoSuchMessageException nsme) {
            message = id;
        } catch (Exception e) {
            message = id;
        }
        return message;
    }

    @Override
    public String getLanguageMessage(String id, String language) {
        Locale locale = LocaleContextHolder.getLocale();
        if (language != null) {
            locale = new Locale(language);
        }
        String message;
        try {
            message = mSource.getMessage(id, null, locale);
        } catch (NoSuchMessageException nsme) {
            message = id;
        } catch (Exception e) {
            message = id;
        }
        return message;
    }

    @Override
    public String getMessage(String id, Object[] arg) {
        Locale locale = LocaleContextHolder.getLocale();
        return mSource.getMessage(id, arg, locale);
    }


    @Override
    public void sendMessageToSp(Job job){
        job.getServiceProvidersList().stream()
                .filter(sp ->
                        job.getProject() == null ||
                                punchesDetailsRepo
                                        .findByProjectIdAndSpId(job.getProject().getId(), sp.getId())
                                        .stream()
                                        .noneMatch(pd ->
                                                pd.getTimestamp()
                                                        .atZone(ZoneId.systemDefault())
                                                        .toLocalDate()
                                                        .equals(job.getEndDate())
                                        )
                )
                .forEach(sp -> {
                    String spToken = this.jwtTokenHelper.generateTokenForReviewForm(job.getId().toString(), String.valueOf(sp.getId()));
                    String spTinyURL = UrlShortenerService.shortenUrl(this.spUI + spToken);
                    try {
                        this.twilioMessageService.sendSMS(sp.getContact(), MessageTemplate.getMessageTemplate(sp.getFirstName() + " " + sp.getLastName(), job.getEndDate().toString(), job.getEndTime().toString(), job.getDescription(), spTinyURL));
                    } catch (Exception ex) {
                        LOGGER.warn("Failed to send review SMS for job {} to service provider {}", job.getId(), sp.getId(), ex);
                    }
                    try {
                        this.emailSendingService.sendEmail(contactEmail, "Review Form for Job: " + job.getTitle(), "Dear " + sp.getFirstName() + ",\n \nHet werk is voltooid, vul alstublieft het formulier in via de volgende link: " + spTinyURL + "\n\nDank u wel", sp.getEmail());
                    } catch (Exception ex) {
                        LOGGER.warn("Failed to send review email for job {} to service provider {}", job.getId(), sp.getId(), ex);
                    }
                });

    }
}
