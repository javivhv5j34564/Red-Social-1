package feedmicroservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "app.rabbitmq", name = "enabled", havingValue = "true")
public class RabbitMQConfig {

    public static final String QUEUE_FEED = "feed.queue";
    public static final String EXCHANGE_FEED = "feed.exchange";
    public static final String ROUTING_KEY = "feed.routing.key";

    @Bean
    public Queue feedQueue() {
        return new Queue(QUEUE_FEED, true);
    }

    @Bean
    public TopicExchange feedExchange() {
        return new TopicExchange(EXCHANGE_FEED);
    }

    @Bean
    public Binding binding(Queue feedQueue, TopicExchange feedExchange) {
        return BindingBuilder.bind(feedQueue).to(feedExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}