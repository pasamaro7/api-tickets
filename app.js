const express = require('express');
const Joi = require('@hapi/joi');
const app = express();
app.use(express.json()); //se pide que la aplicación app.js use un middleware de express (express.json) 
//para recibir datos de tipo json y que la cambie cuando los reciba
app.use(express.urlencoded({ extended: true })); //middleware para recibir datos tipo query string 

/*Al no utilizar base de datos, se usa arreglo ticket para almacenar la información, que inicia con
datos de prueba*/
let ticket = [
    { id: 1, url: 'https://www.google.com.mx', nombreSitio: 'Google', falla: 'Error 404', fecha: '01-01-2021', status: 'Reparado' },
    { id: 2, url: 'https://nodejs.org/en/', nombreSitio: 'node.js', falla: 'Error 500', fecha: '12-03-2021', status: 'Pendiente' }

];
/*
app.get() petición
app.put() modificación
app.post() creación
app.delete() borrado
*/

//Función para petición Get

app.get('/', (req, res) => {
    res.send('Api tickets funcionando');
});
app.get('/api/ticket', (req, res) => {
    res.send(ticket);
});

//Función para petición Get con envío de un parámetro
app.get('/api/ticket/:id', (req, res) => {

    let ticket = existeTicket(req.params.id);
    if (!ticket) {
        res.status(404).send('Ticket  no encontrado'); //si no lo encontró manda mensaje y status
        return;
    }
    res.send(ticket); //se envía el ticket utilizando  postman*/

})

//Función para  petición Post
app.post('/api/ticket', (req, res) => {
    //Validación con el paquete Joi mandando los datos por la función validarTicket
    const { error, value } = validarTicket(req.body.url, req.body.nombreSitio, req.body.falla, req.body.fecha, req.body.status);
    if (!error) {
        const ticket_nuevo = { // se va a crear un ticket
            id: ticket.length + 1, //se agrega el id
            /* los datos los toma de value y los asigna a los campos del arreglo*/
            url: value.url,
            nombreSitio: value.nombreSitio,
            falla: value.falla,
            fecha: value.fecha,
            status: value.status
        };
        ticket.push(ticket_nuevo); //se agrega el ticket en el arreglo
        res.send(ticket); //se envía el ticket utilizando  postman*/
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje); //se manda mensaje en caso de error
    }
});
//Función para  petición Put
app.put('/api/ticket/:id', (req, res) => {
    //se hace la búsqueda del ticket por medio de su id
    let ticket = existeTicket(req.params.id); //busca el ticket en el arreglo
    //si no lo encuentra manda error
    if (!ticket) {
        res.status(404).send('Ticket no encontrado');
        return;
    }
    //Si se encuentra el se hace la validación conla función validarTicket
    const { error, value } = validarTicket(req.body.url, req.body.nombreSitio, req.body.falla, req.body.fecha, req.body.status);
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    /* Si no hay error se hace la modificación de datos*/
    ticket.url = value.url;
    ticket.nombreSitio = value.nombreSitio;
    ticket.falla = value.falla;
    ticket.fecha = value.fecha;
    ticket.status = value.status;
    res.send(ticket);

});


//Función para  petición Delete
app.delete('/api/ticket/:id', (req, res) => {
    let ticket_id = existeTicket(req.params.id); //busca el ticket en el arreglo
    if (!ticket_id) {
        res.status(404).send('Ticket no encontrado');
        return;
    }
    const index = ticket.indexOf(ticket_id); //se detecta el índice del ticket
    ticket.splice(index, 1); //se elimina el ticket , el argumento 1 le dice a la función que sólo ese registro se 
    //eliminará
    res.send(ticket);
});

const port = process.env.PORT || 3000;
/*variable de entorno process.env.PORT toma el puerto 
disponible si no está disponible el puerto 3000.*/
app.listen(port, () => {
    console.log(`Escuchando por el puerto ${port}... `);
});
/**********************  Funciones **************/
function existeTicket(id) { //Función que busca el ticekt
    return (ticket.find(u => u.id === parseInt(id)));
}

function validarTicket(url_s, nomSi, falla, fec, sta) { //Función que valida datos del ticekt
    const schema = Joi.object({ // se define el esquema
        url: Joi.string().min(15).required(),
        nombreSitio: Joi.string().min(4).max(50).required(),
        falla: Joi.string().min(5).max(50).required(),
        fecha: Joi.string().required(),
        status: Joi.string().min(2).max(20).required()
    });
    return (schema.validate({ url: url_s, nombreSitio: nomSi, falla: falla, fecha: fec, status: sta })); //se utiliza el esquema de validación
}