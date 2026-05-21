package feedmicroservice.controller;

import feedmicroservice.config.RabbitMQConfig;
import feedmicroservice.model.Comentario;
import feedmicroservice.model.Feed;
import feedmicroservice.model.FeedActividades;
import feedmicroservice.model.FeedPublicaciones;

import feedmicroservice.repository.ActividadesRepository;
import feedmicroservice.repository.ComentarioRepository;
import feedmicroservice.repository.FeedRepository;
import feedmicroservice.repository.PublicacionesRepository;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feed")
public class FeedController {

    private final FeedRepository feedRepo;
    private final ActividadesRepository actRepo;
    private final PublicacionesRepository pubRepo;
    private final ComentarioRepository comRepo;
    
    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate; // Inyectamos RabbitMQ solo si está habilitado

    @Value("${app.rabbitmq.enabled:false}")
    private boolean rabbitMqEnabled;

    public FeedController(
            FeedRepository feedRepo,
            ActividadesRepository actRepo,
            PublicacionesRepository pubRepo,
            ComentarioRepository comRepo) {

        this.feedRepo = feedRepo;
        this.actRepo = actRepo;
        this.pubRepo = pubRepo;
        this.comRepo = comRepo;
    }

    @GetMapping("/{usuarioId}")
    public List<Feed> obtenerFeed(@PathVariable Long usuarioId) {
        return feedRepo.findByUsuarioDestinatario(usuarioId);
    }

    @PostMapping("/actividad")
    public FeedActividades crearActividad(@RequestBody FeedActividades actividad) {
        Feed feed = new Feed();
        feed.setUsuarioDestinatario(actividad.getFeed().getUsuarioDestinatario());
        feed.setTipo(Feed.TipoFeed.ACTIVIDAD);
        feed = feedRepo.save(feed);
        actividad.setFeed(feed);

        FeedActividades guardada = actRepo.save(actividad);

        enviarMensajeRabbit("Nueva actividad para usuario: " + feed.getUsuarioDestinatario());

        return guardada;
    }

    @PostMapping("/publicacion")
    public FeedPublicaciones crearPublicacion(@RequestBody FeedPublicaciones publicacion) {
        Feed feed = new Feed();
        feed.setUsuarioDestinatario(publicacion.getFeed().getUsuarioDestinatario());
        feed.setTipo(Feed.TipoFeed.PUBLICACION);
        feed = feedRepo.save(feed);
        publicacion.setFeed(feed);

        FeedPublicaciones guardada = pubRepo.save(publicacion);

        enviarMensajeRabbit("Nueva publicación: " + publicacion.getContenido());

        return guardada;
    }

    @PostMapping("/comentario")
    public Comentario crearComentario(@RequestBody Comentario comentario) {
        Comentario guardado = comRepo.save(comentario);

        enviarMensajeRabbit("Nuevo comentario en publicación ID: " + comentario.getPublicacion().getIdPublicaciones());

        return guardado;
    }

    private void enviarMensajeRabbit(String mensaje) {
        if (!rabbitMqEnabled || rabbitTemplate == null) {
            return;
        }
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_FEED, RabbitMQConfig.ROUTING_KEY, mensaje);
    }
}