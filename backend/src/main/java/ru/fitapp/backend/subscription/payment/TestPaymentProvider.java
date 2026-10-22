package ru.fitapp.backend.subscription.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ru.fitapp.backend.subscription.model.PaymentStatus;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Stand-in until a real provider is connected: the "payment page" is our own
 * /subscription/test-pay/{id} screen with «Оплатить» / «Отказ банка» buttons, and saved-card
 * charges always succeed (a card titled "отказ" makes them fail, to test the grace period).
 * Never enable on production with real money expected — anyone can "pay" here.
 */
@Component
public class TestPaymentProvider implements PaymentProvider {

    public static final String CODE = "test";
    public static final String FAILING_CARD_TOKEN = "test-card-fail";

    private final String publicBaseUrl;

    public TestPaymentProvider(@Value("${app.public-base-url:http://localhost:3000}") String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Override
    public String code() {
        return CODE;
    }

    @Override
    public ProviderPayment createPayment(PaymentRequest request) {
        return new ProviderPayment(
                "test-" + UUID.randomUUID(),
                PaymentStatus.PENDING,
                publicBaseUrl + "/subscription/test-pay/" + request.paymentId(),
                null,
                null,
                null
        );
    }

    @Override
    public ProviderPayment chargeSavedMethod(PaymentRequest request, String paymentMethodToken) {
        boolean fail = FAILING_CARD_TOKEN.equals(paymentMethodToken);
        return new ProviderPayment(
                "test-" + UUID.randomUUID(),
                fail ? PaymentStatus.FAILED : PaymentStatus.SUCCEEDED,
                null,
                paymentMethodToken,
                null,
                fail ? "Тестовый отказ банка" : null
        );
    }

    /** The test provider has no server notifications — the test page reports the outcome directly. */
    @Override
    public Optional<PaymentNotification> parseNotification(Map<String, String> headers, String body) {
        return Optional.empty();
    }
}
