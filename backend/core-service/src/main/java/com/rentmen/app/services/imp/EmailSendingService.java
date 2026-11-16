package com.rentmen.app.services.imp;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.models.*;
import com.microsoft.graph.requests.GraphServiceClient;
import com.microsoft.graph.models.UserSendMailParameterSet;
import com.rentmen.app.DTO.JobDto;
import com.rentmen.app.configurations.JwtTokenHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class EmailSendingService {
	private static final Logger LOGGER = LoggerFactory.getLogger(EmailSendingService.class);

	private final GraphServiceClient<?> graphClient;
	private final String mailbox;
	private final String publicBaseUrl;
	private final JwtTokenHelper jwtTokenHelper;

	public EmailSendingService(
			@Value("${microsoft.client-id}") String clientId,
			@Value("${microsoft.client-secret}") String clientSecret,
			@Value("${microsoft.tenant-id}") String tenantId,
			@Value("${microsoft.mailbox}") String mailbox,
			@Value("${eventico.public-base-url:http://localhost:3000}") String publicBaseUrl,
			JwtTokenHelper jwtTokenHelper
	) {
		this.mailbox = mailbox;
		this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
		this.jwtTokenHelper = jwtTokenHelper;

		ClientSecretCredential credential = new ClientSecretCredentialBuilder()
				.clientId(clientId)
				.clientSecret(clientSecret)
				.tenantId(tenantId)
				.build();

		TokenCredentialAuthProvider authProvider = new TokenCredentialAuthProvider(
				Collections.singletonList("https://graph.microsoft.com/.default"),
				credential
		);

		this.graphClient = GraphServiceClient
				.builder()
				.authenticationProvider(authProvider)
				.buildClient();
	}

	public String sendEmail(String from, String subject, String to, Long jobId, Long userId, JobDto updatedJob) {
		if (to == null || to.isBlank()) {
			throw new IllegalArgumentException("Recipient email is required");
		}

		Message message = new Message();
		message.subject = subject;

		// Construct HTML body
		String acceptanceToken = jwtTokenHelper.generateJobOfferAcceptanceToken(jobId, userId);
		String htmlMsg = "<p>Beste gebruiker,</p>"
				+ "<p>U heeft een werkverzoek ontvangen.</p>"
				+ "<p>Datum/Tijd: " + updatedJob.getStartDate() + " " + updatedJob.getStartTime() + "</p>"
				+ "<p><a href=\"" + publicBaseUrl + "/api/job/acceptJobOfferFromEmail?token=" + acceptanceToken + "\">"
				+ "<button style=\"background-color: green; color: white; padding: 10px 15px; border: none; cursor: pointer;\">Accepteren</button>"
				+ "</a></p>"
				+ "<p>Log alstublieft in om te accepteren.</p>"
				+ "<p>Dank u wel</p>";

		// Set message body
		ItemBody messageBody = new ItemBody();
		messageBody.contentType = BodyType.HTML;
		messageBody.content = htmlMsg;
		message.body = messageBody;

		// To Recipient
		Recipient recipient = new Recipient();
		EmailAddress emailAddress = new EmailAddress();
		emailAddress.address = to;
		recipient.emailAddress = emailAddress;
		message.toRecipients = Collections.singletonList(recipient);

		// ParameterSet for sending
		UserSendMailParameterSet params = UserSendMailParameterSet
				.newBuilder()
				.withMessage(message)
				.withSaveToSentItems(true)
				.build();

		// Send the mail
		graphClient.users(mailbox)
				.sendMail(params)
				.buildRequest()
				.post();
		LOGGER.info("Sent job request email for job {} to {}", jobId, to);

		return "Email Sent Successfully";
	}

	public void sendEmail(String from, String subject, String text, String to) {
		if (to == null || to.isBlank()) {
			throw new IllegalArgumentException("Recipient email is required");
		}

		Message message = new Message();
		message.subject = subject;

		// Body (plain text or basic HTML)
		ItemBody messageBody = new ItemBody();
		messageBody.contentType = BodyType.TEXT; // or BodyType.HTML if `text` contains HTML
		messageBody.content = text;
		message.body = messageBody;

		// To Recipient
		Recipient recipient = new Recipient();
		EmailAddress emailAddress = new EmailAddress();
		emailAddress.address = to;
		recipient.emailAddress = emailAddress;
		message.toRecipients = Collections.singletonList(recipient);

		// Wrap in parameter set
		UserSendMailParameterSet params = UserSendMailParameterSet
				.newBuilder()
				.withMessage(message)
				.withSaveToSentItems(true)
				.build();

		// Send
		graphClient.users(mailbox)
				.sendMail(params)
				.buildRequest()
				.post();
		LOGGER.info("Sent notification email to {}", to);
	}

}
