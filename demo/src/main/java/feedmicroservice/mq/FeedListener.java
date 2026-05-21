package feedmicroservice.mq;

// CAMBIO AQUÍ: Ahora apunta a tu paquete real
import feedmicroservice.config.RabbitMQConfig; 
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.rabbitmq", name = "enabled", havingValue = "true")
public class FeedListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_FEED)
    public void receiveMessage(String mensaje) {
        // Esto imprimirá el mensaje en la consola de tu IDE (Eclipse/STS)
        System.out.println("Mensaje recibido desde RabbitMQ: " + mensaje);
    }
}