package ru.fitapp.backend.subscription.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.subscription.model.PaymentStatus;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Robokassa (docs.robokassa.ru, checked 22.10.2026):
 * <ul>
 *     <li>payment — redirect to Merchant/Index.aspx, {@code InvId} = our subscription_payment.id,
 *     {@code Recurring=true} so the card can be charged again (only with ROBOKASSA_RECURRING=true — until Robokassa
 *     enables recurring payments for the shop the parameter makes every payment fail with error 34);
 *     signature {@code MerchantLogin:OutSum:InvId[:Receipt]:Password1};</li>
 *     <li>ResultURL — sent only for successful payments, signature {@code OutSum:InvId:Password2},
 *     reply {@code OK{InvId}};</li>
 *     <li>renewal — POST Merchant/Recurring with {@code PreviousInvoiceID} = InvId of the first
 *     payment (our "saved card" token). "OK…" only means the operation was created — the result
 *     arrives at ResultURL like any payment. Recurring is enabled by Robokassa on request.</li>
 * </ul>
 * In test mode ({@code IsTest=1}) the test passwords from the shop's technical settings are used.
 * Receipts for «Мой налог» are made by Robokassa's «Робочеки СМЗ» (enabled in the shop).
 */
@Component
public class RobokassaPaymentProvider implements PaymentProvider {

    public static final String CODE = "robokassa";

    private static final Logger log = LoggerFactory.getLogger(RobokassaPaymentProvider.class);
    private static final String PAY_URL = "https://auth.robokassa.ru/Merchant/Index.aspx";
    private static final String RECURRING_URL = "https://auth.robokassa.ru/Merchant/Recurring";

    private final String login;
    private final String password1;
    private final String password2;
    private final boolean testMode;
    private final String hashAlgorithm;
    private final boolean sendReceipt;
    private final boolean recurring;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public RobokassaPaymentProvider(
            @Value("${app.robokassa.login:}") String login,
            @Value("${app.robokassa.password1:}") String password1,
            @Value("${app.robokassa.password2:}") String password2,
            @Value("${app.robokassa.test:true}") boolean testMode,
            @Value("${app.robokassa.hash:md5}") String hash,
            @Value("${app.robokassa.receipt:false}") boolean sendReceipt,
            @Value("${app.robokassa.recurring:false}") boolean recurring
    ) {
        this.login = login.trim();
        this.password1 = password1.trim();
        this.password2 = password2.trim();
        this.testMode = testMode;
        this.hashAlgorithm = switch (hash.trim().toLowerCase()) {
            case "sha256" -> "SHA-256";
            case "sha1" -> "SHA-1";
            case "sha384" -> "SHA-384";
            case "sha512" -> "SHA-512";
            default -> "MD5";
        };
        this.sendReceipt = sendReceipt;
        this.recurring = recurring;
    }

    @Override
    public String code() {
        return CODE;
    }

    @Override
    public ProviderPayment createPayment(PaymentRequest request) {
        assertConfigured();
        String outSum = outSum(request.amountKopecks());
        String invId = String.valueOf(request.paymentId());
        String receipt = sendReceipt ? receiptJson(request) : null;

        String signatureBase = receipt == null
                ? String.join(":", login, outSum, invId, password1)
                : String.join(":", login, outSum, invId, receipt, password1);

        Map<String, String> params = new LinkedHashMap<>();
        params.put("MerchantLogin", login);
        params.put("OutSum", outSum);
        params.put("InvId", invId);
        params.put("Description", truncate(request.description(), 100));
        // The card is bound only when recurring payments are enabled for the shop and the trainer agreed (FIT-80).
        if (recurring && request.recurring()) {
            params.put("Recurring", "true");
        }
        if (receipt != null) {
            params.put("Receipt", receipt);
        }
        if (request.payerEmail() != null && !request.payerEmail().isBlank()) {
            params.put("Email", request.payerEmail());
        }
        params.put("Culture", "ru");
        if (testMode) {
            params.put("IsTest", "1");
        }
        params.put("SignatureValue", hash(signatureBase));

        // Our payment id is the Robokassa InvId, so it is also the provider payment id.
        return new ProviderPayment(invId, PaymentStatus.PENDING, PAY_URL + "?" + encode(params), null, null, null);
    }

    @Override
    public ProviderPayment chargeSavedMethod(PaymentRequest request, String paymentMethodToken) {
        assertConfigured();
        String outSum = outSum(request.amountKopecks());
        String invoiceId = String.valueOf(request.paymentId());

        Map<String, String> params = new LinkedHashMap<>();
        params.put("MerchantLogin", login);
        params.put("InvoiceID", invoiceId);
        params.put("PreviousInvoiceID", paymentMethodToken);
        params.put("Description", truncate(request.description(), 100));
        params.put("OutSum", outSum);
        // PreviousInvoiceID is not part of the signature (per the docs).
        params.put("SignatureValue", hash(String.join(":", login, outSum, invoiceId, password1)));

        try {
            HttpResponse<String> response = http.send(
                    HttpRequest.newBuilder(URI.create(RECURRING_URL))
                            .timeout(Duration.ofSeconds(30))
                            .header("Content-Type", "application/x-www-form-urlencoded")
                            .POST(HttpRequest.BodyPublishers.ofString(encode(params)))
                            .build(),
                    HttpResponse.BodyHandlers.ofString()
            );
            String body = response.body() == null ? "" : response.body().trim();
            if (body.startsWith("OK")) {
                // Created; the outcome comes to ResultURL (declines are not reported — the renewal is retried).
                return new ProviderPayment(invoiceId, PaymentStatus.PENDING, null, null, null, null);
            }
            log.warn("Robokassa recurring charge {} rejected: HTTP {} {}", invoiceId, response.statusCode(), body);
            return new ProviderPayment(invoiceId, PaymentStatus.FAILED, null, null, null,
                    truncate("Robokassa: " + (body.isEmpty() ? "HTTP " + response.statusCode() : body), 250));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Robokassa recurring request interrupted", e);
        } catch (Exception e) {
            throw new IllegalStateException("Robokassa recurring request failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<PaymentNotification> parseNotification(Map<String, String> headers, String body) {
        if (login.isEmpty()) {
            return Optional.empty();
        }
        Map<String, String> params = decode(body);
        String outSum = params.get("OutSum");
        String invId = params.get("InvId");
        String signature = params.get("SignatureValue");
        if (outSum == null || invId == null || signature == null) {
            return Optional.empty();
        }

        StringBuilder base = new StringBuilder(outSum).append(':').append(invId).append(':').append(password2);
        params.entrySet().stream()
                .filter(e -> e.getKey().startsWith("Shp_"))
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> base.append(':').append(e.getKey()).append('=').append(e.getValue()));

        if (!hash(base.toString()).equalsIgnoreCase(signature)) {
            log.warn("Robokassa notification for InvId {} has a wrong signature", invId);
            return Optional.empty();
        }

        // ResultURL means "paid"; InvId of a purchase becomes the PreviousInvoiceID for renewals —
        // only if the card was bound (Recurring), otherwise there is nothing to charge later.
        return Optional.of(new PaymentNotification(invId, PaymentStatus.SUCCEEDED, recurring ? invId : null,
                "Банковская карта (Robokassa)", null));
    }

    @Override
    public String acknowledge(PaymentNotification notification) {
        return "OK" + notification.providerPaymentId();
    }

    // ---------------------------------------------------------------- helpers

    /** Receipt for «Робочеки СМЗ» / fiscalization: one service line, no VAT. */
    private String receiptJson(PaymentRequest request) {
        String name = truncate(request.description(), 128).replace("\\", "").replace("\"", "'");
        return "{\"items\":[{\"name\":\"" + name + "\",\"quantity\":1,\"sum\":" + outSum(request.amountKopecks())
                + ",\"payment_method\":\"full_payment\",\"payment_object\":\"service\",\"tax\":\"none\"}]}";
    }

    private void assertConfigured() {
        if (login.isEmpty() || password1.isEmpty() || password2.isEmpty()) {
            throw new ApiException("INTERNAL_ERROR", "Платёжный сервис Robokassa не настроен");
        }
    }

    private static String outSum(int kopecks) {
        return BigDecimal.valueOf(kopecks, 2).toPlainString();
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance(hashAlgorithm).digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String encode(Map<String, String> params) {
        return params.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private static Map<String, String> decode(String body) {
        Map<String, String> result = new LinkedHashMap<>();
        if (body == null || body.isBlank()) {
            return result;
        }
        for (String pair : body.split("&")) {
            int i = pair.indexOf('=');
            String key = URLDecoder.decode(i >= 0 ? pair.substring(0, i) : pair, StandardCharsets.UTF_8);
            String value = i >= 0 ? URLDecoder.decode(pair.substring(i + 1), StandardCharsets.UTF_8) : "";
            result.put(key, value);
        }
        return result;
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
